from abc import ABC, abstractmethod
from typing import List, Optional
from ...domain.entities.achievement import UserAchievement, UserCoupon

class IAchievementRepository(ABC):
    @abstractmethod
    def save_achievement(self, achievement: UserAchievement) -> UserAchievement:
        pass

    @abstractmethod
    def save_coupon(self, coupon: UserCoupon) -> UserCoupon:
        pass

    @abstractmethod
    def get_user_achievements(self, user_id: int) -> List[UserAchievement]:
        pass

    @abstractmethod
    def get_user_active_coupons(self, user_id: int) -> List[UserCoupon]:
        pass
