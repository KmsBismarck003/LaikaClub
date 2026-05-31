from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time

class FunctionCreate(BaseModel):
    date: date
    time: time
    venue_id: int
    room_id: Optional[int] = None

class EventTicketSectionCreate(BaseModel):
    name: str
    price: float
    capacity: int
    available: int
    badge_text: Optional[str] = None
    color_hex: Optional[str] = None

class EventRuleCreate(BaseModel):
    title: str
    icon: str
    description: str

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    event_date: date
    event_time: time
    location: str
    venue: Optional[str] = None
    venue_id: Optional[int] = None
    room_id: Optional[int] = None
    use_seating_map: Optional[bool] = False
    category: str
    price: float
    total_tickets: int
    available_tickets: int
    image_url: Optional[str] = None
    status: str = 'draft'
    grid_position_x: Optional[int] = None
    grid_position_y: Optional[int] = None
    grid_span_x: int = 1
    grid_span_y: int = 1
    grid_page: Optional[int] = None
    functions: Optional[List[FunctionCreate]] = None
    sections: Optional[List[EventTicketSectionCreate]] = None
    rules: Optional[List[EventRuleCreate]] = None
    
    # Permission and Management fields
    ads_enabled: bool = False
    max_ads: int = 5
    merch_enabled: bool = False
    metrics_enabled: bool = False
    assigned_manager_id: Optional[int] = None
    municipality_id: Optional[int] = None

    # Preventa exclusiva por banco (BIN validation)
    presale_enabled: Optional[bool] = False
    presale_bank_name: Optional[str] = None
    presale_bins: Optional[str] = None
    presale_start: Optional[str] = None
    presale_end: Optional[str] = None

class EventTicketSectionUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[float] = None
    capacity: Optional[int] = None
    available: Optional[int] = None
    badge_text: Optional[str] = None
    color_hex: Optional[str] = None

class EventRuleUpdate(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[date] = None
    event_time: Optional[time] = None
    location: Optional[str] = None
    venue: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    total_tickets: Optional[int] = None
    available_tickets: Optional[int] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    grid_position_x: Optional[int] = None
    grid_position_y: Optional[int] = None
    grid_span_x: Optional[int] = 1
    grid_span_y: Optional[int] = 1
    grid_page: Optional[int] = None
    venue_id: Optional[int] = None
    room_id: Optional[int] = None
    use_seating_map: Optional[bool] = None
    functions: Optional[List[FunctionCreate]] = None
    sections: Optional[List[EventTicketSectionUpdate]] = None
    rules: Optional[List[EventRuleUpdate]] = None
    
    # Permission and Management fields
    ads_enabled: Optional[bool] = None
    max_ads: Optional[int] = None
    merch_enabled: Optional[bool] = None
    metrics_enabled: Optional[bool] = None
    assigned_manager_id: Optional[int] = None
    municipality_id: Optional[int] = None

    # Preventa exclusiva por banco (BIN validation)
    presale_enabled: Optional[bool] = None
    presale_bank_name: Optional[str] = None
    presale_bins: Optional[str] = None
    presale_start: Optional[str] = None
    presale_end: Optional[str] = None
