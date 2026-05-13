import httpx
import os
import jwt
from typing import Dict, Any, List
from ...domain.interfaces.achievement_repository import IAchievementRepository
from ...domain.entities.achievement import UserAchievement, UserCoupon
from ....achievements import get_achievements_for_count, generate_coupon_code

TICKET_SERVICE_URL = "http://localhost:8003"

class AchievementService:
    def __init__(self, achievement_repo: IAchievementRepository):
        self.achievement_repo = achievement_repo

    async def get_user_ticket_count(self, user_id: int, token: str) -> int:
        headers = {"Authorization": token} if token else {}
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{TICKET_SERVICE_URL}/my-tickets", headers=headers)
                if resp.status_code == 200:
                    tickets = resp.json()
                    return len(tickets)
        except Exception as e:
            print(f"Error fetching tickets: {e}")
        return 0

    def extract_user_id(self, user_id_header: str, token: str) -> int:
        if user_id_header:
            return int(user_id_header)
        if token and token.startswith("Bearer "):
            token = token.split(" ")[1]
            try:
                secret = os.getenv("JWT_SECRET", "super_secret_laika_club_2026")
                payload = jwt.decode(token, secret, algorithms=["HS256"])
                if "user_id" in payload:
                    return payload["user_id"]
            except Exception as e:
                print(f"JWT decode error: {e}")
        return 1

    async def sync_user_achievements(self, user_id: int, ticket_count: int) -> None:
        unlocked_tiers = get_achievements_for_count(ticket_count)
        
        # Get already unlocked tiers from DB
        current_achievements = self.achievement_repo.get_user_achievements(user_id)
        already_unlocked = [a.tier for a in current_achievements]
        
        for t in unlocked_tiers:
            if t["tier"] not in already_unlocked:
                # 1. Save new achievement
                new_ach = UserAchievement(
                    user_id=user_id,
                    tier=t["tier"],
                    tier_name=t["name"],
                    phase=t["phase"]
                )
                self.achievement_repo.save_achievement(new_ach)
                
                # 2. Save new coupon/reward if applicable
                if t.get("reward_type") in ["percentage", "fixed", "service_fee"]:
                    new_coupon = UserCoupon(
                        user_id=user_id,
                        code=generate_coupon_code(t["tier"]),
                        discount_type=t["reward_type"],
                        discount_value=t["reward_value"],
                        description=t["reward"],
                        uses_left=t.get("uses", 1),
                        is_permanent=1 if t.get("permanent") else 0
                    )
                    self.achievement_repo.save_coupon(new_coupon)

    async def get_user_progress(self, user_id: int, ticket_count: int) -> Dict[str, Any]:
        # Sync first
        await self.sync_user_achievements(user_id, ticket_count)
        
        # Get updated achievements
        unlocked = self.achievement_repo.get_user_achievements(user_id)
        
        user_tier = 1
        if unlocked:
            user_tier = max([a.tier for a in unlocked])
            
        return {
            "user_id": user_id,
            "ticket_count": ticket_count,
            "total_points": ticket_count * 100,
            "tier": user_tier,
            "achievements": [{"tier": a.tier, "name": a.tier_name, "phase": a.phase, "unlocked_at": str(a.unlocked_at)} for a in unlocked]
        }

    def get_user_active_coupons(self, user_id: int) -> List[Dict[str, Any]]:
        coupons = self.achievement_repo.get_user_active_coupons(user_id)
        return [{
            "code": c.code,
            "discount_type": c.discount_type,
            "discount_value": c.discount_value,
            "description": c.description,
            "uses_left": c.uses_left,
            "is_permanent": bool(c.is_permanent)
        } for c in coupons]
