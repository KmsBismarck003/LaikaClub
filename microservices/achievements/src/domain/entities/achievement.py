from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

@dataclass
class TierReward:
    tier: int
    name: str
    phase: str
    requirement: int
    reward: str
    reward_type: str
    reward_value: Optional[float] = None
    uses: Optional[int] = None
    benefit_id: Optional[str] = None
    permanent: bool = False

@dataclass
class UserAchievement:
    user_id: int
    tier: int
    tier_name: str
    phase: str
    id: Optional[int] = None
    unlocked_at: Optional[datetime] = None

@dataclass
class UserCoupon:
    user_id: int
    code: str
    discount_type: str
    discount_value: float
    description: str
    uses_left: int = 1
    is_permanent: int = 0
    id: Optional[int] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
