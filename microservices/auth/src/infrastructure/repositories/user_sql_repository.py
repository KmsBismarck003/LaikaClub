from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from ...domain.entities.user import User
from ...domain.interfaces.user_repository import IUserRepository

class UserSQLRepository(IUserRepository):
    def __init__(self, db: Session):
        self.db = db

    def _map_to_entity(self, row: dict) -> User:
        if not row:
            return None
        
        # Mapear permisos a lista
        permissions = row.get('permissions')
        if isinstance(permissions, str):
            import json
            try:
                permissions = json.loads(permissions)
            except:
                permissions = []
        elif not permissions:
            permissions = []

        return User(
            id=row.get('id'),
            email=row.get('email', ''),
            first_name=row.get('first_name', ''),
            last_name=row.get('last_name', ''),
            role=row.get('role', 'usuario'),
            status=row.get('status', 'active'),
            password_hash=row.get('password_hash'),
            phone=row.get('phone'),
            avatar_url=row.get('avatar_url'),
            is_premium=bool(row.get('is_premium', 0)),
            premium_until=row.get('premium_until'),
            lockout_until=row.get('lockout_until'),
            failed_attempts=row.get('failed_attempts', 0),
            created_at=row.get('created_at'),
            last_login=row.get('last_login'),
            permissions=permissions
        )

    def find_by_id(self, user_id: int) -> Optional[User]:
        query = text("SELECT * FROM users WHERE id = :uid")
        result = self.db.execute(query, {"uid": user_id}).mappings().fetchone()
        if not result:
            return None
        return self._map_to_entity(dict(result))

    def find_by_email(self, email: str) -> Optional[User]:
        query = text("SELECT * FROM users WHERE LOWER(email) = :email")
        result = self.db.execute(query, {"email": email.lower().strip()}).mappings().fetchone()
        if not result:
            return None
        return self._map_to_entity(dict(result))

    def save(self, user: User) -> User:
        from datetime import datetime
        try:
            now = user.created_at or datetime.now()
            insert_query = text("""
                INSERT INTO users (first_name, last_name, email, phone, password_hash, role, status, created_at, social_provider)
                VALUES (:first_name, :last_name, :email, :phone, :password_hash, :role, :status, :now, :provider)
            """)
            
            provider = getattr(user, 'social_provider', None)
            
            self.db.execute(insert_query, {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "password_hash": user.password_hash,
                "role": user.role,
                "status": user.status,
                "now": now.isoformat(),
                "provider": provider
            })
            self.db.commit()
            
            return self.find_by_email(user.email)
        except Exception as e:
            self.db.rollback()
            raise e

    def update(self, user: User) -> User:
        # Aquí irá la lógica del UPDATE a futuro
        pass

    def record_login_success(self, user_id: int) -> None:
        from datetime import datetime
        try:
            self.db.execute(
                text("UPDATE users SET last_login = :now, failed_attempts = 0, lockout_until = NULL WHERE id = :id"), 
                {"now": datetime.now().isoformat(), "id": user_id}
            )
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e

    def record_failed_attempt(self, user_id: int, attempts: int, lockout_until: Optional[str] = None) -> None:
        try:
            self.db.execute(
                text("UPDATE users SET failed_attempts = :attempts, lockout_until = :lu WHERE id = :id"),
                {"attempts": attempts, "lu": lockout_until, "id": user_id}
            )
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e
