from sqlalchemy.orm import Session
from app.models.social import Review
from app.models.product import Product
from app.schemas.social import ReviewCreate, ReviewUpdate

def create_review(db: Session, review: ReviewCreate, buyer_id: int):
    # Get seller_id from product
    product = db.query(Product).filter(Product.product_id == review.product_id).first()
    if not product:
        raise ValueError("Product not found")
        
    db_review = Review(
        product_id=review.product_id,
        buyer_id=buyer_id,
        seller_id=product.seller_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_product_reviews(db: Session, product_id: int, skip: int = 0, limit: int = 100):
    return db.query(Review).filter(Review.product_id == product_id).offset(skip).limit(limit).all()

def get_seller_reviews(db: Session, seller_id: int, skip: int = 0, limit: int = 100):
   return db.query(Review).filter(Review.seller_id == seller_id).offset(skip).limit(limit).all()

def get_review_by_id(db: Session, review_id: int):
    return db.query(Review).filter(Review.review_id == review_id).first()

def update_review(db: Session, review_id: int, review_update: ReviewUpdate):
    db_review = get_review_by_id(db, review_id)
    if not db_review:
        return None
    update_data = review_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_review, key, value)
    db.commit()
    db.refresh(db_review)
    return db_review

def delete_review(db: Session, review_id: int):
    db_review = get_review_by_id(db, review_id)
    if db_review:
        db.delete(db_review)
        db.commit()
    return db_review
