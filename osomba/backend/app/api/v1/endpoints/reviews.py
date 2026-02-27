from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.crud import review as crud_review
from app.schemas import social as schemas
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=schemas.Review, status_code=status.HTTP_201_CREATED)
def create_review(
    *,
    db: Session = Depends(get_db),
    review_in: schemas.ReviewCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new review.
    """
    return crud_review.create_review(db=db, review=review_in, buyer_id=current_user.user_id)

@router.get("/product/{product_id}", response_model=List[schemas.Review])
def read_product_reviews(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get reviews for a product (public).
    """
    return crud_review.get_product_reviews(db=db, product_id=product_id, skip=skip, limit=limit)

@router.get("/seller/{seller_id}", response_model=List[schemas.Review])
def read_seller_reviews(
    *,
    db: Session = Depends(get_db),
    seller_id: int,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get reviews for a seller (public).
    """
    return crud_review.get_seller_reviews(db=db, seller_id=seller_id, skip=skip, limit=limit)

@router.get("/{review_id}", response_model=schemas.Review)
def read_review(
    *,
    db: Session = Depends(get_db),
    review_id: int,
) -> Any:
    """
    Get a specific review by ID.
    """
    review = crud_review.get_review_by_id(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.put("/{review_id}", response_model=schemas.Review)
def update_review_endpoint(
    *,
    db: Session = Depends(get_db),
    review_id: int,
    review_in: schemas.ReviewUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a review. Only the author or an admin can update a review.
    """
    db_review = crud_review.get_review_by_id(db, review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Authorization: only author or admin can update
    if db_review.buyer_id != current_user.user_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return crud_review.update_review(db=db, review_id=review_id, review_update=review_in)

@router.delete("/{review_id}", response_model=schemas.Review)
def delete_review_endpoint(
    *,
    db: Session = Depends(get_db),
    review_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a review. Only the author or an admin can delete a review.
    """
    db_review = crud_review.get_review_by_id(db, review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    # Authorization: only author or admin can delete
    if db_review.buyer_id != current_user.user_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return crud_review.delete_review(db=db, review_id=review_id)
