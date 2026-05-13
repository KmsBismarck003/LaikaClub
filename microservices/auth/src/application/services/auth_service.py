from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException
from ...domain.interfaces.user_repository import IUserRepository
from ....security import verify_password, create_access_token, get_password_hash

class AuthService:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo
        self.MAX_FAILED = 3
        self.LOCKOUT_MINUTES = 10

    def register(self, user_data: dict) -> dict:
        email = user_data.get('email', '').lower().strip()
        
        if self.user_repo.find_by_email(email):
            raise HTTPException(status_code=400, detail="El email ya está registrado")
            
        password_hash = get_password_hash(user_data['password'])
        
        from ...domain.entities.user import User
        new_user = User(
            id=0,
            email=email,
            first_name=user_data.get('firstName', ''),
            last_name=user_data.get('lastName', ''),
            phone=user_data.get('phone'),
            role='usuario',
            status='active',
            password_hash=password_hash,
            created_at=datetime.now()
        )
        
        saved_user = self.user_repo.save(new_user)
        token = create_access_token({"user_id": saved_user.id, "role": saved_user.role})
        
        return {
            "token": token,
            "user": {
                "id": saved_user.id,
                "firstName": saved_user.first_name,
                "lastName": saved_user.last_name,
                "email": saved_user.email,
                "role": saved_user.role,
                "avatarUrl": saved_user.avatar_url,
                "isPremium": False,
                "premiumUntil": None
            }
        }

    def login(self, email: str, password: str, ip_address: str, user_agent: str) -> dict:
        user = self.user_repo.find_by_email(email)
        
        if not user:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        # Bypass para admin
        if user.role != 'admin' and user.lockout_until:
            now = datetime.now()
            lockout_until = user.lockout_until
            if lockout_until.tzinfo:
                lockout_until = lockout_until.replace(tzinfo=None)
            
            if now < lockout_until:
                remaining = int((lockout_until - now).total_seconds())
                raise HTTPException(status_code=423, detail={"message": "Cuenta bloqueada temporalmente", "retry_after": remaining})

        if not user.password_hash or not verify_password(password, user.password_hash):
            if user.role == 'admin':
                raise HTTPException(status_code=401, detail="Credenciales inválidas")
                
            attempts = user.failed_attempts + 1
            if attempts >= self.MAX_FAILED:
                lockout_time = datetime.now() + timedelta(minutes=self.LOCKOUT_MINUTES)
                self.user_repo.record_failed_attempt(user.id, attempts, lockout_time.isoformat())
                remaining = self.LOCKOUT_MINUTES * 60
                raise HTTPException(status_code=423, detail={"message": "Cuenta bloqueada temporalmente", "retry_after": remaining})
            else:
                self.user_repo.record_failed_attempt(user.id, attempts)
                raise HTTPException(status_code=401, detail={"message": "Credenciales inválidas", "attempts": attempts, "max_attempts": self.MAX_FAILED})

        # Login exitoso
        self.user_repo.record_login_success(user.id)
        token = create_access_token({"user_id": user.id, "role": user.role})

        return {
            "token": token,
            "user": {
                "id": user.id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "email": user.email,
                "role": user.role,
                "avatarUrl": user.avatar_url,
                "isPremium": user.is_premium,
                "premiumUntil": user.premium_until,
                "permissions": user.permissions if user.permissions else ["admin.view", "venues.view", "cms.view", "stats.view", "users.view", "events.view"]
            }
        }
