from typing import Dict, Any, Optional
from app.models.order import PaymentProvider
from app.services.payment.gateway import PaymentGateway


class MockGateway(PaymentGateway):
    """
    A mock gateway implementation for architectural scaffolding.
    Simulates successful initiation and verification for all providers.
    """
    def __init__(self, provider: PaymentProvider):
        self.provider = provider

    async def initiate_payment(self, amount: float, currency: str, order_id: int, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "status": "initiated",
            "provider": self.provider,
            "provider_transaction_id": f"mock_tx_{self.provider.lower()}_{order_id}",
            "message": f"Successfully simulated {self.provider} initiation."
        }

    async def verify_payment(self, provider_transaction_id: str) -> bool:
        return True

    async def initiate_payout(self, amount: float, currency: str, recipient_id: str) -> Dict[str, Any]:
        return {"status": "success", "payout_id": "mock_payout_123"}

    async def handle_webhook(self, payload: Dict[str, Any], signature: str) -> Dict[str, Any]:
        return {"status": "processed"}


class PaymentGatewayFactory:
    @staticmethod
    def get_gateway(provider: PaymentProvider) -> PaymentGateway:
        """
        Returns the appropriate gateway implementation for the given provider.
        Currently returns MockGateway for all providers during scaffolding.
        """
        # Future: Switch to real implementations
        # if provider == PaymentProvider.STRIPE:
        #     return StripeGateway()
        return MockGateway(provider)
