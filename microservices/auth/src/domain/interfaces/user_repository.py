from abc import ABC, abstractmethod
from typing import Optional, List
from ...domain.entities.user import User

class IUserRepository(ABC):
    @abstractmethod
    def find_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    def find_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def save(self, user: User) -> User:
        pass
        
    @abstractmethod
    def update(self, user: User) -> User:
        pass
        
    @abstractmethod
    def record_login_success(self, user_id: int) -> None:
        pass
        
    @abstractmethod
    def record_failed_attempt(self, user_id: int, attempts: int, lockout_until: Optional[str] = None) -> None:
        pass

