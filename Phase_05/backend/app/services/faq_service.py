from sqlalchemy.orm import Session
from app.crud import faq as faq_crud
from app.schemas.support import FAQCreate, FAQUpdate
from app.services.ai_service import generate_embedding

def get_faqs(db: Session, skip: int = 0, limit: int = 100, active_only: bool = False):
    return faq_crud.get_faqs(db, skip=skip, limit=limit, active_only=active_only)

def get_faq(db: Session, faq_id: int, active_only: bool = False):
    return faq_crud.get_faq(db, faq_id=faq_id, active_only=active_only)

def create_faq(db: Session, faq: FAQCreate):
    # Combine question and answer for semantic search encoding
    text_to_encode = f"{faq.question} {faq.answer}"
    embedding = generate_embedding(text_to_encode)
    
    return faq_crud.create_faq(db, faq=faq, embedding=embedding)

def update_faq(db: Session, faq_id: int, faq_update: FAQUpdate):
    # Only re-encode if question or answer has changed
    embedding = None
    if faq_update.question is not None or faq_update.answer is not None:
        db_faq = faq_crud.get_faq(db, faq_id)
        if db_faq:
            q = faq_update.question if faq_update.question is not None else db_faq.question
            a = faq_update.answer if faq_update.answer is not None else db_faq.answer
            embedding = generate_embedding(f"{q} {a}")
            
    return faq_crud.update_faq(db, faq_id=faq_id, faq_update=faq_update, embedding=embedding)

def delete_faq(db: Session, faq_id: int):
    return faq_crud.delete_faq(db, faq_id=faq_id)
