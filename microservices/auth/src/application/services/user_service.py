from typing import Optional
from ...domain.interfaces.user_repository import IUserRepository
from ...domain.entities.user import User

class UserService:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    def get_user_profile(self, user_id: int) -> Optional[dict]:
        user = self.user_repo.find_by_id(user_id)
        if not user:
            return None
        
        return {
            "id": user.id,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "avatarUrl": user.avatar_url,
            "createdAt": str(user.created_at) if user.created_at else "",
            "isPremium": user.is_premium,
            "premiumUntil": user.premium_until,
            "permissions": user.permissions
        }
