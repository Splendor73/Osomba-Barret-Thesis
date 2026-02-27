from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.models.order import Payment, PaymentStatus, PaymentProvider
from app.schemas.payment import PaymentInitiate
from app.services.payment.factory import PaymentGatewayFactory


class PaymentService:
    @staticmethod
    async def initiate_payment(db: Session, payment_data: PaymentInitiate) -> Payment:
        # 1. Create a pending payment record in RDS
        db_payment = Payment(
            order_id=payment_data.order_id,
            payment_type=payment_data.payment_type,
            payment_amount=payment_data.payment_amount,
            currency=payment_data.currency,
            payment_status=PaymentStatus.PENDING
        )
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)

        # 2. Get the appropriate gateway and call its initiate method
        gateway = PaymentGatewayFactory.get_gateway(payment_data.payment_type)
        provider_response = await gateway.initiate_payment(
            amount=float(payment_data.payment_amount),
            currency=payment_data.currency,
            order_id=payment_data.order_id,
            metadata=payment_data.metadata
        )

        # 3. Update the record with provider info
        db_payment.provider_transaction_id = provider_response.get("provider_transaction_id")
        db_payment.metadata_json = provider_response
        db.commit()
        db.refresh(db_payment)

        return db_payment

    @staticmethod
    async def verify_payment(db: Session, payment_id: int) -> Payment:
        db_payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
        if not db_payment:
            raise ValueError("Payment not found")

        # If already completed, return
        if db_payment.payment_status == PaymentStatus.COMPLETED:
            return db_payment

        # Call the gateway to verify
        gateway = PaymentGatewayFactory.get_gateway(db_payment.payment_type)
        is_success = await gateway.verify_payment(db_payment.provider_transaction_id)

        if is_success:
            db_payment.payment_status = PaymentStatus.COMPLETED
            db.commit()
            db.refresh(db_payment)

        return db_payment
