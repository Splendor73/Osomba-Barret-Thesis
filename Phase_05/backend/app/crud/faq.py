from sqlalchemy.orm import Session
from app.models.support import FAQ
from app.schemas.support import FAQCreate, FAQUpdate

def get_faq(db: Session, faq_id: int):
    return db.query(FAQ).filter(FAQ.id == faq_id).first()

def get_faqs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(FAQ).order_by(FAQ.order_num.asc()).offset(skip).limit(limit).all()

def create_faq(db: Session, faq: FAQCreate, embedding: list = None):
    db_faq = FAQ(
        **faq.model_dump(),
        embedding=embedding
    )
    db.add(db_faq)
    db.commit()
    db.refresh(db_faq)
    return db_faq

def update_faq(db: Session, faq_id: int, faq_update: FAQUpdate, embedding: list = None):
    db_faq = get_faq(db, faq_id)
    if not db_faq:
        return None
    
    update_data = faq_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_faq, key, value)
        
    if embedding:
        db_faq.embedding = embedding

    db.commit()
    db.refresh(db_faq)
    return db_faq

def delete_faq(db: Session, faq_id: int):
    db_faq = get_faq(db, faq_id)
    if db_faq:
        db.delete(db_faq)
        db.commit()
    return db_faq

def vote_faq(db: Session, faq_id: int, is_helpful: bool):
    db_faq = get_faq(db, faq_id)
    if not db_faq:
        return None
    if is_helpful:
        db_faq.helpful_count = (db_faq.helpful_count or 0) + 1
    else:
        db_faq.not_helpful_count = (db_faq.not_helpful_count or 0) + 1
    db.commit()
    db.refresh(db_faq)
    return db_faq
