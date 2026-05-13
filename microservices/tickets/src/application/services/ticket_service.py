import uuid
import httpx
from datetime import datetime
from typing import List, Dict, Any
from fastapi import HTTPException
from ...domain.interfaces.ticket_repository import ITicketRepository
from ...domain.entities.ticket import Ticket, Payment, RefundRequest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..')))
import random
from common.mongodb_sync import sync_purchase_to_mongo

EVENT_SERVICE_URL = "http://localhost:8002"

class TicketService:
    def __init__(self, ticket_repo: ITicketRepository):
        self.ticket_repo = ticket_repo

    async def purchase_tickets(self, user_id: int, items: list, payment_method: str = "card") -> List[Dict]:
        purchased = []
        now = datetime.now()
        
        try:
            for item in items:
                eid = item.eventId if hasattr(item, 'eventId') else item.get('eventId')
                seat = item.seatId if hasattr(item, 'seatId') else item.get('seatId')
                section = item.sectionName if hasattr(item, 'sectionName') else item.get('sectionName')
                price = item.price if hasattr(item, 'price') else item.get('price', 0)

                unique_code = f"TKT-{uuid.uuid4().hex[:8].upper()}"
                
                ticket = Ticket(
                    user_id=user_id,
                    event_id=eid,
                    ticket_code=unique_code,
                    status='active',
                    seat_id=seat,
                    section_name=section,
                    price=float(price),
                    payment_method=payment_method,
                    purchase_date=now
                )
                
                self.ticket_repo.save_ticket(ticket)
                
                # Sincronización asíncrona a Mongo
                sync_data = {
                    "user_id": user_id,
                    "event_id": eid,
                    "ticket_code": unique_code,
                    "price": float(price),
                    "seat_id": seat,
                    "section": section,
                    "payment_method": payment_method,
                    "purchase_date": now.isoformat(),
                    "type": "ticket_purchase"
                }
                import asyncio
                asyncio.create_task(sync_purchase_to_mongo(sync_data))

                purchased.append({"code": unique_code, "seat": seat})
                
            return purchased
            
        except Exception as e:
            error_msg = str(e)
            # Auditoría por fallo
            first_item = items[0] if items else {}
            eid = first_item.eventId if hasattr(first_item, 'eventId') else first_item.get('eventId', 0)
            amt = sum([float(i.price if hasattr(i, 'price') else i.get('price', 0)) for i in items]) if items else 0
            
            failed_payment = Payment(
                user_id=user_id,
                event_id=eid,
                amount=amt,
                payment_method=payment_method,
                status='failed',
                reference=f"ERR-{uuid.uuid4().hex[:6].upper()}",
                reason=error_msg[:250],
                created_at=datetime.now()
            )
            try:
                self.ticket_repo.save_payment(failed_payment)
            except Exception:
                pass # Evitar romper si la auditoría falla
                
            raise HTTPException(status_code=500, detail=f"Error en procesamiento de compra: {error_msg}")

    async def verify_ticket(self, code: str) -> Dict[str, Any]:
        ticket = self.ticket_repo.find_ticket_by_code(code)
        
        if not ticket:
            return {
                "valid": False,
                "message": "Boleto no encontrado",
                "status": "not_found"
            }
        
        event_name = "Evento desconocido"
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{EVENT_SERVICE_URL}/{ticket.event_id}")
                if resp.status_code == 200:
                    event_name = resp.json().get("name", event_name)
        except Exception:
            pass # Falla silenciosa si no responde el servicio de eventos

        return {
            "valid": ticket.status != 'refunded',
            "already_used": ticket.status == 'used',
            "status": ticket.status,
            "ticket_code": ticket.ticket_code,
            "id": ticket.id,
            "event_id": ticket.event_id,
            "eventName": event_name,
            "ticket_type": ticket.section_name or 'General',
            "purchase_date": str(ticket.purchase_date),
            "customerName": f"Usuario #{ticket.user_id}"
        }

    def process_refund(self, user_id: int, ticket_id: int) -> dict:
        ticket = self.ticket_repo.find_ticket_by_id_and_user(ticket_id, user_id)
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Boleto no encontrado")
        
        if ticket.status == 'refunded':
            raise HTTPException(status_code=400, detail="El boleto ya fue reembolsado")

        self.ticket_repo.update_ticket_status_by_id(ticket_id, 'refunded')
        
        refund_payment = Payment(
            user_id=user_id,
            amount=-ticket.price,
            payment_method='refund',
            status='refunded',
            reference=f"REF-{ticket.ticket_code}",
            created_at=datetime.now()
        )
        self.ticket_repo.save_payment(refund_payment)
        
        return {"status": "success", "message": "Reembolso procesado y asiento liberado"}

    def create_refund_request(self, user_id: int, ticket_id: int, reason: str, detail: str = "") -> dict:
        ticket = self.ticket_repo.find_ticket_by_id_and_user(ticket_id, user_id)
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Boleto no encontrado")
        
        if ticket.status in ['refunded', 'used']:
            raise HTTPException(status_code=400, detail=f"No se puede solicitar reembolso para un boleto {ticket.status}")

        if self.ticket_repo.has_active_refund_request(ticket_id):
            raise HTTPException(status_code=400, detail="Ya existe una solicitud en curso para este boleto")

        request = RefundRequest(
            user_id=user_id,
            ticket_id=ticket_id,
            event_id=ticket.event_id,
            amount=ticket.price,
            reason=reason,
            detail=detail,
            status='pending'
        )
        
        self.ticket_repo.save_refund_request(request)
        return {"status": "success", "message": "Solicitud de reembolso enviada correctamente"}

    async def assign_lucky_seat(self, user_id: int, event_id: int) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{EVENT_SERVICE_URL}/{event_id}")
            if resp.status_code != 200:
                raise HTTPException(status_code=404, detail="Evento no encontrado")
            event_data = resp.json()
            sections = event_data.get("sections", [])
            
        if not sections:
            raise HTTPException(status_code=400, detail="Sin secciones")

        categories = {"VIP": [], "GOLD": [], "GENERAL": []}
        for s in sections:
            p = s.get("price", 0)
            n = s.get("name", "").upper()
            if p >= 1500 or "VIP" in n: categories["VIP"].append(s)
            elif p >= 800 or "ORO" in n: categories["GOLD"].append(s)
            else: categories["GENERAL"].append(s)

        weights = [0.05, 0.15, 0.80]
        pop = ["VIP", "GOLD", "GENERAL"]
        avail = [p for p in pop if categories[p]]
        
        if not avail: 
            winner_section = random.choice(sections)
            choice = "GENERAL"
        else:
            choice = random.choices(pop, weights=weights, k=1)[0]
            if not categories[choice]: choice = avail[-1]
            winner_section = random.choice(categories[choice])
        
        fila = random.choice("ABCDE")
        lugar = random.randint(0, 7)
        seat_id = f"{winner_section.get('id', 'sec')}-{fila}-{lugar}"
        
        await self.purchase_tickets(user_id, [{
            "eventId": event_id,
            "seatId": seat_id,
            "sectionName": winner_section.get("name"),
            "price": 400.0
        }], payment_method="lucky_roulette")

        return {
            "success": True,
            "seatId": seat_id,
            "section_name": winner_section.get("name"),
            "category": choice
        }
