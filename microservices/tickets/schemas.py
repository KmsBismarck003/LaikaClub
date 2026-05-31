from pydantic import BaseModel
from pydantic import ConfigDict
from typing import List, Optional, Any, Union

class TicketItem(BaseModel):
    model_config = ConfigDict(extra='ignore')

    eventId: int
    quantity: int
    functionId: Optional[int] = None
    sectionId: Optional[Union[str, int]] = None
    sectionName: Optional[Union[str, int]] = None
    price: float = 0.0
    seatId: Optional[Union[str, int]] = None

class TicketPurchase(BaseModel):
    """Schema para la compra de boletos.
    Acepta campos extra (paymentId, shippingInfo, shippingMethod)
    que el frontend envía para contexto, sin romper la validación.
    """
    model_config = ConfigDict(extra='ignore')

    items: List[TicketItem]
    paymentMethod: str
    paymentId: Optional[str] = None
    shippingMethod: Optional[str] = None
    shippingInfo: Optional[Any] = None

class TicketVerify(BaseModel):
    ticketCode: str
