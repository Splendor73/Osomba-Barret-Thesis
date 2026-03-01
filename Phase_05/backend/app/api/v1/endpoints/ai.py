from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, SessionDep, OptionalUserDep
from app.services.ai_service import generate_embedding, search_similar_content
from app.models.support import FAQ, ForumPost, ForumCategory, AiQueryLog

router = APIRouter()

class AiSuggestRequest(BaseModel):
    query: str
    language: str = 'en'
    session_id: Optional[str] = None

class AiSuggestion(BaseModel):
    id: str
    title: str
    snippet: str
    category: str
    source: str
    confidence: int

class AiSuggestResponse(BaseModel):
    suggestions: List[AiSuggestion]
    session_id: Optional[str] = None

class AiEscalateRequest(BaseModel):
    session_id: str

@router.post("/suggest", response_model=AiSuggestResponse)
def suggest_answers(request: AiSuggestRequest, db: SessionDep, current_user: OptionalUserDep):
    # 1. Generate embedding using AWS Bedrock
    vector = generate_embedding(request.query)
    
    # 2. Search pgvector database
    similarity_threshold = 0.5 # Example threshold
    raw_results = search_similar_content(db, vector, limit=5, similarity_threshold=similarity_threshold)
    
    suggestions = []
    for row in raw_results:
        source_type = row['source_type']
        source_id = row['source_id']
        similarity = float(row['similarity'])
        confidence = int(similarity * 100)
        
        # 3. Retrieve actual content details based on source type
        if source_type == 'faq':
            faq = db.query(FAQ).filter(FAQ.id == source_id).first()
            if faq:
                category_name = faq.category.name_en if faq.category else "General"
                suggestions.append(AiSuggestion(
                    id=str(faq.id),
                    title=faq.title,
                    snippet=faq.body[:150] + "..." if len(faq.body) > 150 else faq.body,
                    category=category_name,
                    source="FAQ",
                    confidence=confidence
                ))
        elif source_type == 'forum':
            post = db.query(ForumPost).filter(ForumPost.id == source_id).first()
            if post:
                category_name = post.category.name_en if post.category else "General"
                suggestions.append(AiSuggestion(
                    id=str(post.id),
                    title=post.title,
                    snippet=post.body[:150] + "..." if len(post.body) > 150 else post.body,
                    category=category_name,
                    source="Forum Post",
                    confidence=confidence
                ))

    # If no real DB connections yet or no results found, return mock to prevent UI crash
    if not suggestions:
        suggestions = [
            AiSuggestion(
                id="1",
                title="Mock AI Suggestion (Fallback)",
                snippet="We couldn't find a high-confidence match in the database, so here is a fallback suggestion.",
                category="General",
                source="FAQ",
                confidence=50
            )
        ]

    # 4. Log to AiQueryLog
    log = AiQueryLog(
        user_id=current_user.user_id if current_user else None,
        query_text=request.query,
        results_returned=len(suggestions),
        top_result_score=float(suggestions[0].confidence / 100.0) if suggestions else None,
        escalated_to_forum=False
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return AiSuggestResponse(
        suggestions=suggestions,
        session_id=str(log.id)
    )

@router.post("/escalate")
def escalate_query(request: AiEscalateRequest, db: SessionDep):
    log = db.query(AiQueryLog).filter(AiQueryLog.id == int(request.session_id)).first()
    if not log:
        raise HTTPException(status_code=404, detail="Query log not found")
    log.escalated_to_forum = True
    db.commit()
    return {"status": "success"}
