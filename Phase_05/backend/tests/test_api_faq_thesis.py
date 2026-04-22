import pytest
from app.main import app
from app.api.dependencies import get_current_user, get_admin_user
from app.core.config import settings
from app.models.user import User

API_PREFIX = f"{settings.SUPPORT_API_PREFIX}{settings.API_V1_STR}"

@pytest.fixture
def mock_user(db_session):
    from datetime import datetime
    user = User(
        user_id=1004,
        email="customer@example.com",
        full_name="Test Customer",
        role="BUYER",
        accepted_terms_at=datetime.utcnow(),
        terms_version="1.0"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def mock_admin(db_session):
    from datetime import datetime
    admin = User(
        user_id=1005,
        email="admin@example.com",
        full_name="Test Admin",
        role="admin",
        accepted_terms_at=datetime.utcnow(),
        terms_version="1.0"
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

def test_read_faqs(client):
    response = client.get(f"{API_PREFIX}/support/faq/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_public_faq_reads_hide_inactive_entries(client, db_session):
    from app.models.support import FAQ

    active_faq = FAQ(
        question="Visible FAQ",
        answer="This answer should remain public.",
        is_active=True,
        order_num=1,
    )
    hidden_faq = FAQ(
        question="Hidden FAQ",
        answer="This answer should stay private.",
        is_active=False,
        order_num=2,
    )
    db_session.add_all([active_faq, hidden_faq])
    db_session.commit()
    db_session.refresh(active_faq)
    db_session.refresh(hidden_faq)

    list_resp = client.get(f"{API_PREFIX}/support/faq/")
    assert list_resp.status_code == 200
    questions = [faq["question"] for faq in list_resp.json()]
    assert "Visible FAQ" in questions
    assert "Hidden FAQ" not in questions

    detail_resp = client.get(f"{API_PREFIX}/support/faq/{hidden_faq.id}")
    assert detail_resp.status_code == 404

def test_create_and_update_faq_as_admin(client, mock_admin):
    from app.api.dependencies import get_agent_user
    app.dependency_overrides[get_admin_user] = lambda: mock_admin
    app.dependency_overrides[get_agent_user] = lambda: mock_admin
    
    import app.services.ai_service as ai_service
    original_generate = ai_service.generate_embedding
    ai_service.generate_embedding = lambda text: [0.1] * 384
    
    try:
        # Create FAQ
        response = client.post(
            f"{API_PREFIX}/support/faq/",
            json={"question": "Test FAQ", "answer": "Test Answer", "is_active": True, "order_num": 1}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["question"] == "Test FAQ"
        faq_id = data["id"]
        
        # Update FAQ
        update_resp = client.put(
            f"{API_PREFIX}/support/faq/{faq_id}",
            json={"question": "Updated FAQ", "answer": "Updated Answer"}
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["question"] == "Updated FAQ"
        
        # Vote on FAQ
        app.dependency_overrides[get_current_user] = lambda: User(user_id=1006)
        vote_resp = client.post(f"{API_PREFIX}/support/faq/{faq_id}/vote", json={"is_helpful": True})
        assert vote_resp.status_code == 200
        assert vote_resp.json()["helpful_count"] == 1
        
    finally:
        ai_service.generate_embedding = original_generate
        app.dependency_overrides.clear()
