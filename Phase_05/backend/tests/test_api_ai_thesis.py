import pytest
from app.main import app
from app.api.dependencies import get_current_user
from app.core.config import settings
from app.models.support import FAQ, ForumCategory, ForumTopic

API_PREFIX = f"{settings.SUPPORT_API_PREFIX}{settings.API_V1_STR}"

def test_suggest_ai_query(client, db_session):
    # We will patch generate_embedding and search_similar_content at the router level
    import app.api.v1.endpoints.ai as ai_mod
    original_generate_emb = ai_mod.generate_embedding
    original_search = ai_mod.search_similar_content
    
    ai_mod.generate_embedding = lambda text: [0.1] * 384
    
    # Mocking search_similar_content to return some mocked results
    ai_mod.search_similar_content = lambda db, vector, limit, similarity_threshold: [
        {"source_type": "faq", "source_id": 999, "similarity": 0.85}
    ]
    
    try:
        response = client.post(
            f"{API_PREFIX}/support/ai/suggest",
            json={"query": "How do I reset my password?", "language": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "suggestions" in data
        assert "session_id" in data
        
        # Test Escalate
        session_id = data["session_id"]
        
        # Escalate needs an ID
        esc_response = client.post(
            f"{API_PREFIX}/support/ai/escalate",
            json={"session_id": session_id}
        )
        assert esc_response.status_code == 200
        assert esc_response.json()["status"] == "success"
        
    finally:
        ai_mod.generate_embedding = original_generate_emb
        ai_mod.search_similar_content = original_search

def test_ai_suggest_excludes_inactive_faqs_and_deleted_topics(client, db_session):
    import app.api.v1.endpoints.ai as ai_mod

    category = db_session.query(ForumCategory).filter_by(name="General").first()
    if not category:
        category = ForumCategory(name="General", description="General discussions")
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

    active_faq = FAQ(
        question="Active FAQ",
        answer="This answer should be returned.",
        category_id=category.id,
        is_active=True,
        embedding=[0.1] * 384
    )
    inactive_faq = FAQ(
        question="Inactive FAQ",
        answer="This answer should be hidden.",
        category_id=category.id,
        is_active=False,
        embedding=[0.1] * 384
    )
    visible_topic = ForumTopic(
        title="Visible Topic",
        content="Visible thread content",
        user_id=1234,
        category_id=category.id,
        embedding=[0.1] * 384
    )
    deleted_topic = ForumTopic(
        title="Deleted Topic",
        content="Deleted thread content",
        user_id=1235,
        category_id=category.id,
        is_deleted=True,
        embedding=[0.1] * 384
    )
    db_session.add_all([active_faq, inactive_faq, visible_topic, deleted_topic])
    db_session.commit()
    db_session.refresh(active_faq)
    db_session.refresh(inactive_faq)
    db_session.refresh(visible_topic)
    db_session.refresh(deleted_topic)

    original_generate_emb = ai_mod.generate_embedding
    original_search = ai_mod.search_similar_content
    ai_mod.generate_embedding = lambda text: [0.1] * 384
    ai_mod.search_similar_content = lambda db, vector, limit, similarity_threshold: [
        {"source_type": "faq", "source_id": active_faq.id, "similarity": 0.95},
        {"source_type": "faq", "source_id": inactive_faq.id, "similarity": 0.94},
        {"source_type": "forum", "source_id": visible_topic.id, "similarity": 0.93},
        {"source_type": "forum", "source_id": deleted_topic.id, "similarity": 0.92},
    ]

    try:
        response = client.post(
            f"{API_PREFIX}/support/ai/suggest",
            json={"query": "Support visibility", "language": "en"}
        )
        assert response.status_code == 200
        suggestions = response.json()["suggestions"]
        titles = [suggestion["title"] for suggestion in suggestions]
        assert "Active FAQ" in titles
        assert "Visible Topic" in titles
        assert "Inactive FAQ" not in titles
        assert "Deleted Topic" not in titles
    finally:
        ai_mod.generate_embedding = original_generate_emb
        ai_mod.search_similar_content = original_search
