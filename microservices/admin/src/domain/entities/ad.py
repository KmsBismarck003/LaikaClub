from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Ad:
    title: str
    image_url: str
    link_url: Optional[str] = None
    position: str = "main"
    active: bool = True
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    click_count: int = 0

@dataclass
class AdClick:
    ad_id: int
    user_id: Optional[int] = None
    id: Optional[int] = None
    clicked_at: Optional[datetime] = None
