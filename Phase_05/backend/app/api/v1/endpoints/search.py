from fastapi import APIRouter
from app.api.dependencies import SessionDep
from app.services import search_service

router = APIRouter()

@router.get("/")
def semantic_search(query: str, db: SessionDep):
    """
    Public semantic search endpoint utilizing sentence-transformers and pgvector.
    Results include formatted data from FAQs and Forum Topics natively sorted
    by cosine <-> vector distance.
    """
    # Assuming public search for ease of use. Can enforce token if required.
    return search_service.search_support_content(db, query, user_id=None)
