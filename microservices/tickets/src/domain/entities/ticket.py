from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

@dataclass
class Ticket:
    user_id: int
    event_id: int
    ticket_code: str
    status: str
    seat_id: str
    section_name: str
    price: float
    payment_method: str
    id: Optional[int] = None
    purchase_date: Optional[datetime] = None
    redeemed_at: Optional[datetime] = None

@dataclass
class Payment:
    user_id: int
    amount: float
    payment_method: str
    status: str
    reference: str
    event_id: Optional[int] = None
    reason: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None

@dataclass
class RefundRequest:
    user_id: int
    ticket_id: int
    event_id: int
    amount: float
    reason: str
    status: str
    detail: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
