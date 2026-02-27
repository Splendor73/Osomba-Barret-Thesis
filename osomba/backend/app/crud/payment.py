from sqlalchemy.orm import Session
from app.models.order import Payment
from app.schemas.payment import PaymentCreate, PaymentUpdate

def create_payment(db: Session, payment: PaymentCreate):
    payment_data = payment.model_dump()
    if 'payment_type' in payment_data and hasattr(payment_data['payment_type'], 'value'):
        payment_data['payment_type'] = payment_data['payment_type'].value
    if 'payment_status' in payment_data and hasattr(payment_data['payment_status'], 'value'):
        payment_data['payment_status'] = payment_data['payment_status'].value
        
    db_payment = Payment(**payment_data)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_payment_by_id(db: Session, payment_id: int):
    return db.query(Payment).filter(Payment.payment_id == payment_id).first()

def get_all_payments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Payment).offset(skip).limit(limit).all()

def update_payment(db: Session, payment_id: int, payment_update: PaymentUpdate):
    db_payment = get_payment_by_id(db, payment_id)
    if not db_payment:
        return None
    update_data = payment_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_payment, key, value)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def delete_payment(db: Session, payment_id: int):
    db_payment = get_payment_by_id(db, payment_id)
    if db_payment:
        db.delete(db_payment)
        db.commit()
    return db_payment
