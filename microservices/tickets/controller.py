from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
import httpx
import traceback
import uuid
from datetime import datetime
import random
from ..common.mongodb_sync import sync_purchase_to_mongo

EVENT_SERVICE_URL = "http://localhost:8002"

async def get_user_tickets(db: Session, user_id: int):
    try:
        query = text("SELECT * FROM tickets WHERE user_id = :user_id ORDER BY purchase_date DESC")
        tickets_rows = db.execute(query, {"user_id": user_id}).fetchall()
        tickets = [dict(row._mapping) for row in tickets_rows]
        
        async with httpx.AsyncClient() as client:
            for tkt in tickets:
                try:
                    resp = await client.get(f"{EVENT_SERVICE_URL}/{tkt['event_id']}")
                    if resp.status_code == 200:
                        ev_data = resp.json()
                        
                        # Find matching function/schedule if event_function_id is present
                        func_date = None
                        func_time = None
                        fid = tkt.get("event_function_id")
                        if fid and ev_data.get("functions"):
                            for func in ev_data.get("functions"):
                                if func.get("id") == fid:
                                    func_date = func.get("event_date") or func.get("date")
                                    func_time = func.get("event_time") or func.get("time")
                                    break
                        
                        final_date = func_date or ev_data.get("event_date") or ev_data.get("date")
                        final_time = func_time or ev_data.get("event_time") or ev_data.get("time") or "N/A"
                        
                        tkt["event"] = {
                            "id": ev_data.get("id"),
                            "name": ev_data.get("name"),
                            "date": final_date,
                            "time": final_time,
                            "venue_name": ev_data.get("venue_name") or ev_data.get("venue"),
                            "image_url": ev_data.get("image_url"),
                            "room": ev_data.get("room"),
                            "seating_map": ev_data.get("seating_map"),
                            "zones": ev_data.get("zones")
                        }
                        tkt["eventName"] = ev_data.get("name")
                        tkt["date"] = final_date
                        tkt["time"] = final_time
                        tkt["venue"] = ev_data.get("venue_name") or ev_data.get("venue")
                        tkt["imageUrl"] = ev_data.get("image_url")
                        tkt["event_name"] = ev_data.get("name")
                        tkt["event_date"] = final_date
                        tkt["event_time"] = final_time
                        tkt["venue_name"] = ev_data.get("venue_name") or ev_data.get("venue")
                    else:
                        tkt["event_name"] = "Info no disponible"
                        tkt["event_date"] = None
                        tkt["event_time"] = "N/A"
                        tkt["venue_name"] = "Lugar no especificado"
                        tkt["eventName"] = "Info no disponible"
                        tkt["date"] = None
                        tkt["time"] = "N/A"
                        tkt["venue"] = "Lugar no especificado"
                except:
                    tkt["event_name"] = "Error de conexión"
                    tkt["event_date"] = None
                    tkt["event_time"] = "N/A"
                    tkt["venue_name"] = "Lugar no especificado"
                    tkt["eventName"] = "Error de conexión"
                    tkt["date"] = None
                    tkt["time"] = "N/A"
                    tkt["venue"] = "Lugar no especificado"
        
        return tickets
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error en Ticket Service")

def get_busy_seats(db: Session, event_id: int, function_id: int = None):
    """Retorna lista de IDs de asientos ocupados para un evento"""
    if function_id:
        query = text("SELECT seat_id FROM tickets WHERE event_id = :eid AND event_function_id = :fid AND status IN ('active', 'used')")
        rows = db.execute(query, {"eid": event_id, "fid": function_id}).fetchall()
    else:
        query = text("SELECT seat_id FROM tickets WHERE event_id = :eid AND status IN ('active', 'used')")
        rows = db.execute(query, {"eid": event_id}).fetchall()
    return [row[0] for row in rows if row[0]]

async def purchase_tickets(db: Session, user_id: int, items: list, payment_method: str = "card"):
    try:
        purchased = []
        now = datetime.now()
        for item in items:
            # Manejo flexible de objetos o diccionarios
            if isinstance(item, dict):
                eid = item.get('eventId') or item.get('event_id')
                seat = item.get('seatId') or item.get('seat_id')
                section = item.get('sectionName') or item.get('section_name')
                price = item.get('price', 0)
                fid = item.get('functionId') or item.get('function_id') or item.get('event_function_id')
            else:
                eid = getattr(item, 'eventId', None) or getattr(item, 'event_id', None)
                seat = getattr(item, 'seatId', None) or getattr(item, 'seat_id', None)
                section = getattr(item, 'sectionName', None) or getattr(item, 'section_name', None)
                price = getattr(item, 'price', 0)
                fid = getattr(item, 'functionId', None) or getattr(item, 'function_id', None) or getattr(item, 'event_function_id', None)

            unique_code = f"TKT-{uuid.uuid4().hex[:8].upper()}"
            db.execute(text("""
                INSERT INTO tickets (user_id, event_id, ticket_code, status, purchase_date, seat_id, section_name, price, payment_method, event_function_id)
                VALUES (:uid, :eid, :code, 'active', :now, :seat, :sec, :price, :pm, :fid)
            """), {
                "uid": user_id, "eid": eid, "code": unique_code, "now": now,
                "seat": seat, "sec": section, "price": price, "pm": payment_method, "fid": fid
            })
            
            # SINCRONIZACIÓN A MONGO (Para análisis Spark/Jupyter)
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
        
        db.commit()
        return purchased
    except Exception as e:
        db.rollback()
        print(f"Error en compra: {e}")
        raise HTTPException(status_code=500, detail="Error en procesamiento de compra")

def create_payment_intent(db: Session, user_id: int, amount: float, event_id: int = None, method: str = "card"):
    try:
        ref = f"PAY-{uuid.uuid4().hex[:6].upper()}"
        db.execute(text("""
            INSERT INTO payments (user_id, event_id, amount, payment_method, status, reference, created_at)
            VALUES (:uid, :eid, :amt, :pm, 'pending', :ref, :now)
        """), {
            "uid": user_id, "eid": event_id, "amt": amount, "pm": method, "ref": ref, "now": datetime.now()
        })
        db.commit()
        return {"payment_id": ref, "status": "pending", "amount": amount}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creando pago: {str(e)}")

async def confirm_payment(db: Session, reference: str):
    try:
        # Obtener datos del pago antes de confirmar
        payment_query = text("SELECT * FROM payments WHERE reference = :ref")
        payment = db.execute(payment_query, {"ref": reference}).mappings().fetchone()
        
        db.execute(text("UPDATE payments SET status = 'completed' WHERE reference = :ref"), {"ref": reference})
        db.commit()
        
        if payment:
            # SINCRONIZACION A MONGO
            sync_data = {
                "user_id": payment['user_id'],
                "event_id": payment['event_id'],
                "amount": float(payment['amount']),
                "payment_method": payment['payment_method'],
                "reference": reference,
                "status": "completed",
                "confirmed_at": datetime.now().isoformat(),
                "type": "payment_confirmation"
            }
            import asyncio
            asyncio.create_task(sync_purchase_to_mongo(sync_data))

        return {"status": "success", "message": "Pago confirmado"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al confirmar pago")

def process_refund(db: Session, user_id: int, ticket_id: int):
    try:
        query = text("SELECT * FROM tickets WHERE id = :tid AND user_id = :uid")
        ticket = db.execute(query, {"tid": ticket_id, "uid": user_id}).mappings().fetchone()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Boleto no encontrado")
        
        if ticket['status'] == 'refunded':
            raise HTTPException(status_code=400, detail="El boleto ya fue reembolsado")

        db.execute(text("UPDATE tickets SET status = 'refunded' WHERE id = :tid"), {"tid": ticket_id})
        db.execute(text("""
            INSERT INTO payments (user_id, amount, status, reference, created_at)
            VALUES (:uid, :amt, 'refunded', :ref, :now)
        """), {
            "uid": user_id, "amt": -ticket['price'], "ref": f"REF-{ticket['ticket_code']}", "now": datetime.now()
        })
        
        db.commit()
        return {"status": "success", "message": "Reembolso procesado y asiento liberado"}
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en reembolso: {str(e)}")

async def get_user_refunds(db: Session, user_id: int):
    try:
        query = text("SELECT * FROM tickets WHERE user_id = :user_id AND status = 'refunded' ORDER BY purchase_date DESC")
        tickets_rows = db.execute(query, {"user_id": user_id}).fetchall()
        tickets = [dict(row._mapping) for row in tickets_rows]
        
        async with httpx.AsyncClient() as client:
            for tkt in tickets:
                try:
                    resp = await client.get(f"{EVENT_SERVICE_URL}/{tkt['event_id']}")
                    if resp.status_code == 200:
                        ev_data = resp.json()
                        tkt["event_name"] = ev_data.get("name", "Evento desconocido")
                        tkt["event_date"] = ev_data.get("event_date")
                        tkt["imageUrl"] = ev_data.get("image_url")
                    else:
                        tkt["event_name"] = "Info no disponible"
                except:
                    tkt["event_name"] = "Error de conexión"
        
        refunds = []
        for tkt in tickets:
            refunds.append({
                "id": tkt["id"],
                "status": "approved",
                "amount": tkt["price"],
                "reason": "Reembolso procesado",
                "detail": f"Asiento: {tkt['seat_id'] or 'N/A'}, Sección: {tkt['section_name'] or 'N/A'}",
                "created_at": tkt["purchase_date"],
                "ticket": {
                    "id": tkt["id"],
                    "ticket_code": tkt["ticket_code"],
                    "price": tkt["price"],
                    "seat_id": tkt["seat_id"],
                    "section_name": tkt["section_name"],
                    "event_id": tkt["event_id"],
                    "eventName": tkt["event_name"],
                    "imageUrl": tkt.get("imageUrl")
                }
            })
        return refunds
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error en recuperar reembolsos")

def verify_ticket(db: Session, code: str):
    query = text("SELECT * FROM tickets WHERE ticket_code = :code")
    result = db.execute(query, {"code": code}).mappings().fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Boleto no encontrado")
    return dict(result)

def redeem_ticket(db: Session, code: str):
    ticket = verify_ticket(db, code)
    if ticket['status'] != 'active':
        raise HTTPException(status_code=400, detail=f"Boleto no válido ({ticket['status']})")
    try:
        db.execute(text("UPDATE tickets SET status = 'used', redeemed_at = :now WHERE ticket_code = :code"), 
                   {"now": datetime.now(), "code": code})
        db.commit()
        return {"status": "success", "message": "Boleto canjeado"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def assign_lucky_seat(db: Session, user_id: int, event_id: int):
    log_path = "c:\\Users\\Pc\\Music\\proyectolaika2.9.9.10\\lucky_debug.txt"
    try:
        with open(log_path, "a") as f: f.write(f"[{datetime.now()}] assign_lucky_seat STARTED\n")
        async with httpx.AsyncClient() as client:
            with open(log_path, "a") as f: f.write(f"[{datetime.now()}] Fetching event {event_id}\n")
            resp = await client.get(f"{EVENT_SERVICE_URL}/{event_id}")
            if resp.status_code != 200:
                with open(log_path, "a") as f: f.write(f"[{datetime.now()}] Event not found 404\n")
                raise HTTPException(status_code=404, detail="Evento no encontrado")
            event_data = resp.json()
            sections = event_data.get("sections", [])
            with open(log_path, "a") as f: f.write(f"[{datetime.now()}] Sections found: {len(sections)}\n")
            
        if not sections:
            with open(log_path, "a") as f: f.write(f"[{datetime.now()}] Error: Sin secciones\n")
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
        with open(log_path, "a") as f: f.write(f"[{datetime.now()}] Avail categories: {avail}\n")
        
        if not avail: winner_section = random.choice(sections)
        else:
            choice = random.choices(pop, weights=weights, k=1)[0]
            if not categories[choice]: choice = avail[-1]
            winner_section = random.choice(categories[choice])

        with open(log_path, "a") as f: f.write(f"[{datetime.now()}] Winner section: {winner_section.get('name')}\n")
        
        fila = random.choice("ABCDE")
        lugar = random.randint(0, 7)
        seat_id = f"{winner_section.get('id', 'sec')}-{fila}-{lugar}"
        with open(log_path, "a") as f: f.write(f"[{datetime.now()}] Assigned seat_id: {seat_id}\n")
        
        await purchase_tickets(db, user_id, [{
            "eventId": event_id,
            "seatId": seat_id,
            "sectionName": winner_section.get("name"),
            "price": 400.0
        }], payment_method="lucky_roulette")

        with open(log_path, "a") as f: f.write(f"[{datetime.now()}] Purchase Tickets DONE\n")

        return {
            "success": True,
            "seatId": seat_id,
            "section_name": winner_section.get("name"),
            "category": choice
        }
    except Exception as e:
        with open(log_path, "a") as f: f.write(f"[{datetime.now()}] EXCEPTION CAUGHT: {str(e)}\n")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
