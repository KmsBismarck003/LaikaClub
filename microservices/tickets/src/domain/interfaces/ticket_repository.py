from pydantic import BaseModelabc import ABC, abstractmethod
from typing import Optional, List
from ...domain.entities.ticket import Ticket, Payment

class ITicketRepository(ABC):
    @abstractmethod
    def save_ticket(self, ticket: Ticket) -> Ticket:
        pass

    @abstractmethod
    def save_payment(self, payment: Payment) -> Payment:
        pass

    @abstractmethod
    def find_ticket_by_code(self, ticket_code: str) -> Optional[Ticket]:
        pass

    @abstractmethod
    def update_ticket_status(self, ticket_code: str, status: str, redeemed_at: Optional[str] = None) -> None:
        pass

    @abstractmethod
    def find_ticket_by_id_and_user(self, ticket_id: int, user_id: int) -> Optional[Ticket]:
        pass

    @abstractmethod
    def update_ticket_status_by_id(self, ticket_id: int, status: str) -> None:
        pass

    @abstractmethod
    def save_refund_request(self, request: RefundRequest) -> RefundRequest:
        pass

    @abstractmethod
    def has_active_refund_request(self, ticket_id: int) -> bool:
        pass


