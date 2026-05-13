from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from ...domain.entities.ticket import Ticket, Payment
from ...domain.interfaces.ticket_repository import ITicketRepository
from datetime import datetime

class TicketSQLRepository(ITicketRepository):
    def __init__(self, db: Session):
        self.db = db

    def save_ticket(self, ticket: Ticket) -> Ticket:
        now = ticket.purchase_date or datetime.now()
        query = text("""
            INSERT INTO tickets (user_id, event_id, ticket_code, status, purchase_date, seat_id, section_name, price, payment_method)
            VALUES (:uid, :eid, :code, :status, :now, :seat, :sec, :price, :pm)
        """)
        
        try:
            self.db.execute(query, {
                "uid": ticket.user_id,
                "eid": ticket.event_id,
                "code": ticket.ticket_code,
                "status": ticket.status,
                "now": now,
                "seat": ticket.seat_id,
                "sec": ticket.section_name,
                "price": ticket.price,
                "pm": ticket.payment_method
            })
            self.db.commit()
            return ticket # In a real scenario, we'd query to get the assigned ID
        except Exception as e:
            self.db.rollback()
            raise e

    def save_payment(self, payment: Payment) -> Payment:
        now = payment.created_at or datetime.now()
        query = text("""
            INSERT INTO payments (user_id, event_id, amount, payment_method, status, reference, reason, created_at)
            VALUES (:uid, :eid, :amt, :pm, :status, :ref, :reason, :now)
        """)
        try:
            self.db.execute(query, {
                "uid": payment.user_id,
                "eid": payment.event_id,
                "amt": payment.amount,
                "pm": payment.payment_method,
                "status": payment.status,
                "ref": payment.reference,
                "reason": payment.reason,
                "now": now
            })
            self.db.commit()
            return payment
        except Exception as e:
            self.db.rollback()
            raise e

    def find_ticket_by_code(self, ticket_code: str) -> Optional[Ticket]:
        query = text("SELECT * FROM tickets WHERE ticket_code = :code")
        row = self.db.execute(query, {"code": ticket_code}).mappings().fetchone()
        
        if not row:
            return None
            
        return Ticket(
            id=row['id'],
            user_id=row['user_id'],
            event_id=row['event_id'],
            ticket_code=row['ticket_code'],
            status=row['status'],
            seat_id=row['seat_id'],
            section_name=row['section_name'],
            price=float(row['price']),
            payment_method=row['payment_method'],
            purchase_date=row['purchase_date'],
            redeemed_at=row.get('redeemed_at')
        )

    def update_ticket_status(self, ticket_code: str, status: str, redeemed_at: Optional[str] = None) -> None:
        query = text("UPDATE tickets SET status = :status, redeemed_at = :now WHERE ticket_code = :code")
        try:
            self.db.execute(query, {"status": status, "now": redeemed_at, "code": ticket_code})
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e

    def find_ticket_by_id_and_user(self, ticket_id: int, user_id: int) -> Optional[Ticket]:
        query = text("SELECT * FROM tickets WHERE id = :tid AND user_id = :uid")
        row = self.db.execute(query, {"tid": ticket_id, "uid": user_id}).mappings().fetchone()
        
        if not row:
            return None
            
        return Ticket(
            id=row['id'],
            user_id=row['user_id'],
            event_id=row['event_id'],
            ticket_code=row['ticket_code'],
            status=row['status'],
            seat_id=row['seat_id'],
            section_name=row['section_name'],
            price=float(row['price']),
            payment_method=row['payment_method'],
            purchase_date=row['purchase_date'],
            redeemed_at=row.get('redeemed_at')
        )

    def update_ticket_status_by_id(self, ticket_id: int, status: str) -> None:
        query = text("UPDATE tickets SET status = :status WHERE id = :tid")
        try:
            self.db.execute(query, {"status": status, "tid": ticket_id})
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e

    def save_refund_request(self, request: RefundRequest) -> RefundRequest:
        from ...domain.entities.ticket import RefundRequest
        query = text("""
            INSERT INTO refund_requests (user_id, ticket_id, event_id, amount, reason, detail, status)
            VALUES (:uid, :tid, :eid, :amt, :reason, :detail, :status)
        """)
        try:
            self.db.execute(query, {
                "uid": request.user_id,
                "tid": request.ticket_id,
                "eid": request.event_id,
                "amt": request.amount,
                "reason": request.reason,
                "detail": request.detail,
                "status": request.status
            })
            self.db.commit()
            return request
        except Exception as e:
            self.db.rollback()
            raise e

    def has_active_refund_request(self, ticket_id: int) -> bool:
        query = text("SELECT id FROM refund_requests WHERE ticket_id = :tid AND status != 'rejected'")
        return self.db.execute(query, {"tid": ticket_id}).fetchone() is not None
