from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.payment import Payment, PaymentInitiate, PaymentResponse, PaymentUpdate
from app.services.payment.service import PaymentService
from app.crud import payment as crud_payment
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(
    payment_data: PaymentInitiate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Initiate a payment request with a selected provider.
    """
    try:
        # We could add logic here to ensure the user owns the order being paid for
        payment = await PaymentService.initiate_payment(db, payment_data)
        return payment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment initiation failed: {str(e)}"
        )

@router.get("/verify/{payment_id}", response_model=PaymentResponse)
async def verify_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verify the status of a payment.
    """
    try:
        payment = await PaymentService.verify_payment(db, payment_id)
        # We could add auth logic here to ensure the user can view this payment
        return payment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment verification failed: {str(e)}"
        )

# --- Standard Admin CRUD for Payments ---

@router.get("/", response_model=List[Payment])
def read_all_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all payments. Admin only.
    """
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")
    payments = crud_payment.get_all_payments(db, skip=skip, limit=limit)
    return payments


@router.get("/{payment_id}", response_model=Payment)
def read_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific payment by ID. Admin only.
    """
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db_payment = crud_payment.get_payment_by_id(db, payment_id=payment_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment

@router.put("/{payment_id}", response_model=Payment)
def update_payment_endpoint(
    payment_id: int,
    payment_in: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a payment. Admin only.
    """
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return crud_payment.update_payment(db=db, payment_id=payment_id, payment_update=payment_in)

@router.delete("/{payment_id}", response_model=Payment)
def delete_payment_endpoint(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a payment. Admin only.
    """
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db_payment = crud_payment.get_payment_by_id(db, payment_id=payment_id)
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return crud_payment.delete_payment(db=db, payment_id=payment_id)
