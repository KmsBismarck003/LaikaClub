from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from datetime import datetime
from ...domain.entities.achievement import UserAchievement, UserCoupon
from ...domain.interfaces.achievement_repository import IAchievementRepository

class AchievementSQLRepository(IAchievementRepository):
    def __init__(self, db: Session):
        self.db = db

    def save_achievement(self, achievement: UserAchievement) -> UserAchievement:
        now = achievement.unlocked_at or datetime.utcnow()
        query = text("""
            INSERT INTO user_achievements (user_id, tier, tier_name, phase, unlocked_at)
            VALUES (:uid, :tier, :tname, :phase, :now)
        """)
        try:
            self.db.execute(query, {
                "uid": achievement.user_id,
                "tier": achievement.tier,
                "tname": achievement.tier_name,
                "phase": achievement.phase,
                "now": now
            })
            self.db.commit()
            return achievement
        except Exception as e:
            self.db.rollback()
            raise e

    def save_coupon(self, coupon: UserCoupon) -> UserCoupon:
        now = coupon.created_at or datetime.utcnow()
        query = text("""
            INSERT INTO user_coupons (user_id, code, discount_type, discount_value, description, uses_left, expires_at, is_permanent, created_at)
            VALUES (:uid, :code, :dtype, :dval, :desc, :uses, :exp, :perm, :now)
        """)
        try:
            self.db.execute(query, {
                "uid": coupon.user_id,
                "code": coupon.code,
                "dtype": coupon.discount_type,
                "dval": coupon.discount_value,
                "desc": coupon.description,
                "uses": coupon.uses_left,
                "exp": coupon.expires_at,
                "perm": coupon.is_permanent,
                "now": now
            })
            self.db.commit()
            return coupon
        except Exception as e:
            self.db.rollback()
            raise e

    def get_user_achievements(self, user_id: int) -> List[UserAchievement]:
        query = text("SELECT * FROM user_achievements WHERE user_id = :uid")
        rows = self.db.execute(query, {"uid": user_id}).mappings().fetchall()
        
        return [UserAchievement(
            id=row['id'],
            user_id=row['user_id'],
            tier=row['tier'],
            tier_name=row['tier_name'],
            phase=row['phase'],
            unlocked_at=row['unlocked_at']
        ) for row in rows]

    def get_user_active_coupons(self, user_id: int) -> List[UserCoupon]:
        # Consider both uses_left > 0 and is_permanent
        # Also filter out expired coupons
        query = text("""
            SELECT * FROM user_coupons 
            WHERE user_id = :uid 
            AND (uses_left > 0 OR is_permanent = 1)
            AND (expires_at IS NULL OR expires_at > :now)
        """)
        rows = self.db.execute(query, {"uid": user_id, "now": datetime.utcnow()}).mappings().fetchall()
        
        return [UserCoupon(
            id=row['id'],
            user_id=row['user_id'],
            code=row['code'],
            discount_type=row['discount_type'],
            discount_value=float(row['discount_value'] or 0),
            description=row['description'],
            uses_left=row['uses_left'],
            expires_at=row.get('expires_at'),
            is_permanent=row['is_permanent'],
            created_at=row['created_at']
        ) for row in rows]
