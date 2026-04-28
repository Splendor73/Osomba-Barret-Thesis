from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, SessionDep, OptionalUserDep
from app.services.ai_service import generate_embedding, search_similar_content
from app.models.support import FAQ, ForumTopic, ForumPost, ForumCategory, AiQueryLog
from app.core.config import settings

router = APIRouter()

class AiSuggestRequest(BaseModel):
    # React sends the search text and language for POST /support/ai/suggest.
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
    # Turn the user's question into a vector before searching FAQ/forum content.
    vector = generate_embedding(request.query)
    
    # pgvector returns the closest stored FAQ/topic embeddings above the threshold.
    similarity_threshold = settings.ai_similarity_threshold
    raw_results = search_similar_content(db, vector, limit=5, similarity_threshold=similarity_threshold)
    
    suggestions = []
    for row in raw_results:
        source_type = row['source_type']
        source_id = row['source_id']
        similarity = float(row['similarity'])
        confidence = int(similarity * 100)
        
        # Convert raw vector hits into the same card shape the React page renders.
        if source_type == 'faq':
            faq = db.query(FAQ).filter(FAQ.id == source_id, FAQ.is_active.is_(True)).first()
            if faq:
                category_name = faq.category.name if hasattr(faq, 'category') and faq.category else "General"
                suggestions.append(AiSuggestion(
                    id=str(faq.id),
                    title=faq.question,
                    snippet=faq.answer[:150] + "..." if len(faq.answer) > 150 else faq.answer,
                    category=category_name,
                    source="FAQ",
                    confidence=confidence
                ))
        elif source_type == 'forum':
            topic = db.query(ForumTopic).filter(ForumTopic.id == source_id, ForumTopic.is_deleted.is_(False)).first()
            if topic:
                category_name = topic.category.name if topic.category else "General"
                suggestions.append(AiSuggestion(
                    id=str(topic.id),
                    title=topic.title,
                    snippet=topic.content[:150] + "..." if len(topic.content) > 150 else topic.content,
                    category=category_name,
                    source="Forum Post",
                    confidence=confidence
                ))

    # Keyword fallback keeps the demo useful when embeddings are missing or low confidence.
    if not suggestions:
        keyword = f"%{request.query}%"
        existing_ids = set()

        faq_hits = db.query(FAQ).filter(
            FAQ.is_active.is_(True),
            (FAQ.question.ilike(keyword)) | (FAQ.answer.ilike(keyword))
        ).limit(5).all()
        for faq in faq_hits:
            category_name = faq.category.name if hasattr(faq, 'category') and faq.category else "General"
            suggestions.append(AiSuggestion(
                id=str(faq.id), title=faq.question,
                snippet=faq.answer[:150] + "..." if len(faq.answer) > 150 else faq.answer,
                category=category_name, source="FAQ", confidence=30
            ))
            existing_ids.add(('faq', faq.id))

        topic_hits = db.query(ForumTopic).filter(
            ForumTopic.is_deleted.is_(False),
            (ForumTopic.title.ilike(keyword)) | (ForumTopic.content.ilike(keyword))
        ).limit(5).all()
        for topic in topic_hits:
            category_name = topic.category.name if topic.category else "General"
            suggestions.append(AiSuggestion(
                id=str(topic.id), title=topic.title,
                snippet=topic.content[:150] + "..." if len(topic.content) > 150 else topic.content,
                category=category_name, source="Forum Post", confidence=30
            ))
            existing_ids.add(('topic', topic.id))

    # Log each AI query so admin analytics can count searches and forum escalations.
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
    # React calls this before routing to /post so analytics can track AI deflection.
    log = db.query(AiQueryLog).filter(AiQueryLog.id == int(request.session_id)).first()
    if not log:
        raise HTTPException(status_code=404, detail="Query log not found")
    log.escalated_to_forum = True
    db.commit()
    return {"status": "success"}
