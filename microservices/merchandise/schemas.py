from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class MerchandiseSettingsBase(BaseModel):
    is_enabled: bool = False
    activation_fee_paid: bool = False
    commission_percentage: Decimal = Decimal("10.00")

class MerchandiseSettingsResponse(MerchandiseSettingsBase):
    manager_id: int
    enabled_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ====== VARIANTES ======
class MerchandiseVariantBase(BaseModel):
    sku: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    price: Decimal
    stock: int = 0
    is_active: bool = True

class MerchandiseVariantCreate(MerchandiseVariantBase):
    pass

class MerchandiseVariantUpdate(BaseModel):
    id: Optional[int] = None # Para saber si actualizar o crear en cascada
    sku: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None

class MerchandiseVariantResponse(MerchandiseVariantBase):
    id: int
    item_id: int
    model_config = ConfigDict(from_attributes=True)


# ====== ITEM PRINCIPAL ======
class MerchandiseItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_official: bool = True
    rating: float = 4.5
    status: str = 'draft'
    admin_status: str = 'pending_review'
    event_id: Optional[int] = None

class MerchandiseItemCreate(MerchandiseItemBase):
    variants: List[MerchandiseVariantCreate]

class MerchandiseItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    admin_status: Optional[str] = None
    event_id: Optional[int] = None
    variants: Optional[List[MerchandiseVariantUpdate]] = None

class MerchandiseItemResponse(MerchandiseItemBase):
    id: int
    manager_id: int
    created_at: datetime
    variants: List[MerchandiseVariantResponse] = []
    model_config = ConfigDict(from_attributes=True)


# ====== ORDENES ======
class OrderItemCreate(BaseModel):
    variant_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    user_id: int
    payment_method: str = 'card'

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
