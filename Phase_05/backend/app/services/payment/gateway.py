from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class PaymentGateway(ABC):
    @abstractmethod
    async def initiate_payment(self, amount: float, currency: str, order_id: int, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Initiates a payment request with the provider.
        Returns a dictionary containing provider-specific response data (e.g., redirect URL, STK Push status).
        """
        pass

    @abstractmethod
    async def verify_payment(self, provider_transaction_id: str) -> bool:
        """
        Verifies the status of a payment with the provider.
        Returns True if successful, False otherwise.
        """
        pass

    @abstractmethod
    async def initiate_payout(self, amount: float, currency: str, recipient_id: str) -> Dict[str, Any]:
        """
        Initiates a payout/disbursement to a vendor or user.
        """
        pass

    @abstractmethod
    async def handle_webhook(self, payload: Dict[str, Any], signature: str) -> Dict[str, Any]:
        """
        Processes an incoming webhook from the payment provider.
        """
        pass
