from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.api.dependencies import SessionDep, AgentUserDep
from app.schemas.support import FAQCreate, FAQUpdate, FAQResponse, FAQVote
from app.services import faq_service
from app.crud import faq as faq_crud

router = APIRouter()

def _enrich_faq(faq) -> dict:
    """Add category_name and category_icon from relationship."""
    data = FAQResponse.model_validate(faq).model_dump()
    if faq.category:
        data["category_name"] = faq.category.name
        data["category_icon"] = faq.category.icon
    return data

@router.get("/", response_model=List[FAQResponse])
def get_faqs(db: SessionDep, skip: int = 0, limit: int = 100):
    faqs = faq_service.get_faqs(db, skip, limit)
    return [_enrich_faq(f) for f in faqs]

@router.get("/{faq_id}", response_model=FAQResponse)
def get_faq(faq_id: int, db: SessionDep):
    faq = db.query(faq_crud.FAQ).filter(faq_crud.FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return _enrich_faq(faq)

@router.post("/", response_model=FAQResponse)
def create_faq(faq: FAQCreate, db: SessionDep, agent: AgentUserDep):
    # For Phase 4, we use AWS Bedrock to generate embeddings
    from app.services.ai_service import generate_embedding
    embedding = generate_embedding(faq.question + " " + faq.answer)
    return faq_crud.create_faq(db, faq, embedding)

@router.put("/{faq_id}", response_model=FAQResponse)
def update_faq(faq_id: int, faq_update: FAQUpdate, db: SessionDep, agent: AgentUserDep):
    faq_updated = faq_service.update_faq(db, faq_id, faq_update)
    if not faq_updated:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq_updated

@router.delete("/{faq_id}")
def delete_faq(faq_id: int, db: SessionDep, agent: AgentUserDep):
    faq = faq_service.delete_faq(db, faq_id)
    return {"status": "deleted", "id": faq.id} if faq else {"status": "not found"}

@router.post("/{faq_id}/vote", response_model=FAQResponse)
def vote_faq(faq_id: int, vote: FAQVote, db: SessionDep):
    """Public endpoint — no auth required. Increments helpful or not_helpful counter."""
    faq = faq_crud.vote_faq(db, faq_id=faq_id, is_helpful=vote.is_helpful)
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq
