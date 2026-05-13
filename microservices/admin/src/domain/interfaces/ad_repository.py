from abc import ABC, abstractmethod
from typing import List, Optional
from ...domain.entities.ad import Ad

class IAdRepository(ABC):
    @abstractmethod
    def find_all(self, only_active: bool = False) -> List[Ad]:
        pass

    @abstractmethod
    def find_by_id(self, ad_id: int) -> Optional[Ad]:
        pass

    @abstractmethod
    def save(self, ad: Ad) -> Ad:
        pass

    @abstractmethod
    def update(self, ad: Ad) -> Ad:
        pass

    @abstractmethod
    def delete(self, ad_id: int) -> None:
        pass

    @abstractmethod
    def record_click(self, ad_id: int, user_id: Optional[int] = None) -> None:
        pass

    @abstractmethod
    def get_clicks_info(self, ad_id: int) -> List[dict]:
        pass
