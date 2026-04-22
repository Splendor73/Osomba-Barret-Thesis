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
    similarity_threshold = settings.ai_similarity_threshold
    raw_results = search_similar_content(db, vector, limit=5, similarity_threshold=similarity_threshold)
    
    suggestions = []
    for row in raw_results:
        source_type = row['source_type']
        source_id = row['source_id']
        similarity = float(row['similarity'])
        confidence = int(similarity * 100)
        
        # 3. Retrieve actual content details based on source type
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

    # Fallback: text-based search when semantic search returns nothing
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
