from pydantic import BaseModel
from typing import List, Optional

class TicketItem(BaseModel):
    eventId: int
    quantity: int
    functionId: Optional[int] = None
    sectionId: Optional[str] = None
    sectionName: Optional[str] = None
    price: float = 0.0
    seatId: Optional[str] = None

class TicketPurchase(BaseModel):
    items: List[TicketItem]
    paymentMethod: str

class TicketVerify(BaseModel):
    ticketCode: str
