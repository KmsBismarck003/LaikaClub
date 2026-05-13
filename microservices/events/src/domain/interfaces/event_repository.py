from abc import ABC, abstractmethod
from typing import Optional, List
from ...domain.entities.event import Event

class IEventRepository(ABC):
    @abstractmethod
    def find_by_id(self, event_id: int) -> Optional[Event]:
        pass

    @abstractmethod
    def find_all(self, limit: int = 100) -> List[Event]:
        pass

    @abstractmethod
    def save(self, event: Event) -> Event:
        pass
        
    @abstractmethod
    def delete(self, event_id: int) -> None:
        pass
