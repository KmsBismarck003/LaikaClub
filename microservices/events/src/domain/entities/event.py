from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime

@dataclass
class EventSection:
    name: str
    capacity: int
    price: float
    id: Optional[int] = None
    event_id: Optional[int] = None
    available: Optional[int] = None
    badge_text: Optional[str] = None
    color_hex: Optional[str] = None

@dataclass
class EventRule:
    description: str
    id: Optional[int] = None
    event_id: Optional[int] = None
    title: Optional[str] = None
    icon: Optional[str] = None
    rule_type: Optional[str] = None

@dataclass
class Event:
    title: str
    description: str
    event_date: str
    status: str
    category: str
    created_by: int
    id: Optional[int] = None
    banner_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    name: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None
    venue: Optional[str] = None
    price: Optional[float] = None
    total_tickets: Optional[int] = None
    available_tickets: Optional[int] = None
    image_url: Optional[str] = None
    grid_position_x: Optional[int] = 0
    grid_position_y: Optional[int] = 0
    grid_span_x: Optional[int] = 1
    grid_span_y: Optional[int] = 1
    grid_page: Optional[int] = 0
    sections: List[EventSection] = field(default_factory=list)
    rules: List[EventRule] = field(default_factory=list)
