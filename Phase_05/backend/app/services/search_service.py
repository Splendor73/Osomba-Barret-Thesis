from sqlalchemy.orm import Session
from app.models.support import ForumTopic, ForumPost, FAQ
from app.services.ai_service import generate_embedding
from app.core.config import settings
import time

def search_support_content(db: Session, query: str, user_id: int = None):
    """
    Performs a semantic vector search across FAQs and ForumTopics.
    Logs the query performance implicitly.
    """
    start_time = time.time()
    
    # 1. Generate text embedding for the search query
    query_vector = generate_embedding(query)
    
    threshold = settings.ai_similarity_threshold

    # 2. Search FAQs using pgvector cosine distance: <->
    faq_results = (
        db.query(FAQ, FAQ.embedding.cosine_distance(query_vector).label("distance"))
        .filter(FAQ.embedding.cosine_distance(query_vector) < (1 - threshold))
        .order_by(FAQ.embedding.cosine_distance(query_vector))
        .limit(5)
        .all()
    )
    
    # 3. Search Forum Topics using pgvector cosine distance: <->
    topic_results = (
        db.query(ForumTopic, ForumTopic.embedding.cosine_distance(query_vector).label("distance"))
        .filter(ForumTopic.embedding.cosine_distance(query_vector) < (1 - threshold))
        .order_by(ForumTopic.embedding.cosine_distance(query_vector))
        .limit(5)
        .all()
    )
    
    # Process results into a standard JSON array
    results = []
    best_score = 0.0
    
    for f, distance in faq_results:
        score = 1 - distance
        best_score = max(best_score, score)
        results.append({
            "type": "faq",
            "id": f.id,
            "title": f.question,
            "content": f.answer,
            "score": round(score, 3)
        })
        
    for t, distance in topic_results:
        score = 1 - distance
        best_score = max(best_score, score)
        results.append({
            "type": "topic",
            "id": t.id,
            "title": t.title,
            "content": t.content[:200] + "..." if len(t.content) > 200 else t.content,
            "score": round(score, 3)
        })
        
    # Sort unified results by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    
    processing_ms = int((time.time() - start_time) * 1000)

    return {
        "query": query,
        "results": results,
        "processing_time_ms": processing_ms
    }
