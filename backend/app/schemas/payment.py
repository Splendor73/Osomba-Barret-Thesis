from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.models.order import PaymentProvider, PaymentStatus

class PaymentBase(BaseModel):
    order_id: int
    payment_type: PaymentProvider
    payment_amount: float
    currency: Optional[str] = 'USD'

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    payment_status: Optional[PaymentStatus] = None
    provider_transaction_id: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class Payment(PaymentBase):
    payment_id: int
    payment_status: PaymentStatus
    provider_transaction_id: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PaymentInitiate(PaymentBase):
    """Schema for initiating a payment."""
    metadata: Optional[Dict[str, Any]] = None

class PaymentResponse(Payment):
    """Standard response for payment information."""
    pass
