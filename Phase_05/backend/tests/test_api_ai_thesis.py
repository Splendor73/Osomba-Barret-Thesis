import pytest
from app.main import app
from app.api.dependencies import get_current_user

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
            "/api/v1/support/ai/suggest",
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
            "/api/v1/support/ai/escalate",
            json={"session_id": session_id}
        )
        assert esc_response.status_code == 200
        assert esc_response.json()["status"] == "success"
        
    finally:
        ai_mod.generate_embedding = original_generate_emb
        ai_mod.search_similar_content = original_search

