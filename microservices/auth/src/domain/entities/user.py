from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class User:
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    status: str
    password_hash: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_premium: bool = False
    premium_until: Optional[datetime] = None
    lockout_until: Optional[datetime] = None
    failed_attempts: int = 0
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    permissions: list = None
