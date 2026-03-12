import pytest
from datetime import datetime
from app.main import app
from app.api.dependencies import get_current_user, get_agent_user, get_admin_user
from app.models.user import User

@pytest.fixture
def mock_user(db_session):
    from datetime import datetime
    from app.models.support import ForumCategory
    
    # Needs a mock category due to constraint
    category = db_session.query(ForumCategory).filter_by(name="General").first()
    if not category:
        category = ForumCategory(
            name="General",
            description="General discussions"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)
        
    user = User(
        user_id=1001,
        email="customer@example.com",
        full_name="Test Customer",
        role="BUYER",
        accepted_terms_at=datetime.utcnow(),
        terms_version="1.0"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Attach category_id so tests can use it dynamically
    user.tmp_category_id = category.id
    return user

@pytest.fixture
def mock_agent(db_session):
    agent = User(
        user_id=1002,
        email="agent@example.com",
        full_name="Test Agent",
        role="agent",
        accepted_terms_at=datetime.utcnow(),
        terms_version="1.0"
    )
    db_session.add(agent)
    db_session.commit()
    db_session.refresh(agent)
    return agent

@pytest.fixture
def mock_admin(db_session):
    admin = User(
        user_id=1003,
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

def test_create_and_get_topic(client, mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    # Create topic
    response = client.post(
        "/api/v1/support/topics",
        json={"title": "How do I return an item?", "content": "I bought a wrong item and want to return it.", "category_id": mock_user.tmp_category_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "How do I return an item?"
    assert data["content"] == "I bought a wrong item and want to return it."
    topic_id = data["id"]
    
    # Get topic
    response = client.get(f"/api/v1/support/topics/{topic_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "How do I return an item?"
    assert response.json()["user_id"] == 1001
    
    app.dependency_overrides.clear()

def test_agent_official_answer(client, mock_user, mock_agent):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    # Create topic
    response = client.post(
        "/api/v1/support/topics",
        json={"title": "Official answer test", "content": "Help me!", "category_id": mock_user.tmp_category_id}
    )
    topic_id = response.json()["id"]
    
    # Switch to agent
    app.dependency_overrides[get_agent_user] = lambda: mock_agent
    
    import app.api.v1.endpoints.forum as forum_mod
    original_send = forum_mod.send_notification_email
    forum_mod.send_notification_email = lambda *args, **kwargs: True
    
    try:
        # Post official answer
        response = client.post(
            f"/api/v1/support/topics/{topic_id}/official-answer",
            json={"content": "Here is the official answer."}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Here is the official answer."
        assert data["is_accepted_answer"] is True
        assert data["user_id"] == 1002
    finally:
        forum_mod.send_notification_email = original_send
    
    app.dependency_overrides.clear()

def test_convert_to_faq(client, mock_user, mock_agent, mock_admin):
    # Customer creates topic
    app.dependency_overrides[get_current_user] = lambda: mock_user
    topic_resp = client.post(
        "/api/v1/support/topics",
        json={"title": "To be FAQ", "content": "Question", "category_id": mock_user.tmp_category_id}
    )
    topic_id = topic_resp.json()["id"]
    
    import app.api.v1.endpoints.forum as forum_mod
    original_send = forum_mod.send_notification_email
    forum_mod.send_notification_email = lambda *args, **kwargs: True
    
    try:
        # Agent answers
        app.dependency_overrides[get_agent_user] = lambda: mock_agent
        ans_resp = client.post(
            f"/api/v1/support/topics/{topic_id}/official-answer",
            json={"content": "Answer"}
        )
        post_id = ans_resp.json()["id"]
        
        # Admin converts to FAQ
        app.dependency_overrides[get_admin_user] = lambda: mock_admin
        # We might need to override the AI generate_embedding in this test otherwise it'll call bedrock actually!
        # Let's see if generate_embedding is mocked or handles missing AWS keys.
        # Actually, if AWS keys are available, it works. If not, maybe it fails. Let's patch it.
        
        original_generate = forum_mod.generate_embedding
        forum_mod.generate_embedding = lambda text: [0.1] * 384
        
        try:
            faq_resp = client.post(
                f"/api/v1/support/topics/{topic_id}/convert-to-faq",
                json={"post_id": post_id, "question": "To be FAQ?"}
            )
            assert faq_resp.status_code == 200
            assert "id" in faq_resp.json()
        finally:
            forum_mod.generate_embedding = original_generate
    finally:
        forum_mod.send_notification_email = original_send
        app.dependency_overrides.clear()
