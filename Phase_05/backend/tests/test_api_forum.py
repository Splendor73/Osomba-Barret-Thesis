import pytest
from datetime import datetime
from app.main import app
from app.core.config import settings
from app.api.dependencies import get_current_user, get_agent_user, get_admin_user
from app.models.user import User

API_PREFIX = f"{settings.SUPPORT_API_PREFIX}{settings.API_V1_STR}"

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
        role="BUYER",
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

@pytest.fixture
def mock_blocked_user(db_session):
    blocked = User(
        user_id=1009,
        email="blocked@example.com",
        full_name="Blocked User",
        role="BUYER",
        is_banned=True,
        accepted_terms_at=datetime.utcnow(),
        terms_version="1.0"
    )
    db_session.add(blocked)
    db_session.commit()
    db_session.refresh(blocked)
    return blocked

def test_create_and_get_topic(client, mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    # Create topic
    response = client.post(
        f"{API_PREFIX}/support/topics",
        json={"title": "How do I return an item?", "content": "I bought a wrong item and want to return it.", "category_id": mock_user.tmp_category_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "How do I return an item?"
    assert data["content"] == "I bought a wrong item and want to return it."
    topic_id = data["id"]
    
    # Get topic
    response = client.get(f"{API_PREFIX}/support/topics/{topic_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "How do I return an item?"
    assert response.json()["user_id"] == 1001
    
    app.dependency_overrides.clear()

def test_agent_official_answer(client, mock_user, mock_agent):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    # Create topic
    response = client.post(
        f"{API_PREFIX}/support/topics",
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
            f"{API_PREFIX}/support/topics/{topic_id}/official-answer",
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
        f"{API_PREFIX}/support/topics",
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
            f"{API_PREFIX}/support/topics/{topic_id}/official-answer",
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
                f"{API_PREFIX}/support/topics/{topic_id}/convert-to-faq",
                json={"post_id": post_id, "question": "To be FAQ?"}
            )
            assert faq_resp.status_code == 200
            assert "id" in faq_resp.json()
        finally:
            forum_mod.generate_embedding = original_generate
    finally:
        forum_mod.send_notification_email = original_send
        app.dependency_overrides.clear()

def test_anonymous_can_read_but_cannot_write(client, mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    create_resp = client.post(
        f"{API_PREFIX}/support/topics",
        json={"title": "Readable thread", "content": "Visible to guests.", "category_id": mock_user.tmp_category_id}
    )
    topic_id = create_resp.json()["id"]

    reply_resp = client.post(
        f"{API_PREFIX}/support/topics/{topic_id}/posts",
        json={"content": "Readable reply"}
    )
    post_id = reply_resp.json()["id"]
    app.dependency_overrides.clear()

    topics_resp = client.get(f"{API_PREFIX}/support/topics")
    assert topics_resp.status_code == 200
    assert any(topic["id"] == topic_id for topic in topics_resp.json())

    topic_resp = client.get(f"{API_PREFIX}/support/topics/{topic_id}")
    assert topic_resp.status_code == 200
    assert topic_resp.json()["id"] == topic_id

    posts_resp = client.get(f"{API_PREFIX}/support/topics/{topic_id}/posts")
    assert posts_resp.status_code == 200
    assert any(post["id"] == post_id for post in posts_resp.json())

    guest_topic_create = client.post(
        f"{API_PREFIX}/support/topics",
        json={"title": "Guest write", "content": "Guests should not write.", "category_id": mock_user.tmp_category_id}
    )
    assert guest_topic_create.status_code == 403

    guest_reply_create = client.post(
        f"{API_PREFIX}/support/topics/{topic_id}/posts",
        json={"content": "Guests should not reply."}
    )
    assert guest_reply_create.status_code == 403

    guest_report = client.post(
        f"{API_PREFIX}/support/reports",
        json={"topic_id": topic_id, "reason": "Guest report should require login"}
    )
    assert guest_report.status_code == 403

def test_blocked_user_cannot_write_support_content(client, mock_user, mock_blocked_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    topic_resp = client.post(
        f"{API_PREFIX}/support/topics",
        json={"title": "Original thread", "content": "Visible but protected.", "category_id": mock_user.tmp_category_id}
    )
    topic_id = topic_resp.json()["id"]

    reply_resp = client.post(
        f"{API_PREFIX}/support/topics/{topic_id}/posts",
        json={"content": "Existing reply"}
    )
    post_id = reply_resp.json()["id"]

    app.dependency_overrides[get_current_user] = lambda: mock_blocked_user

    blocked_topic = client.post(
        f"{API_PREFIX}/support/topics",
        json={"title": "Blocked topic", "content": "Should fail", "category_id": mock_user.tmp_category_id}
    )
    assert blocked_topic.status_code == 403
    assert "contact us" in blocked_topic.json()["detail"].lower()

    blocked_reply = client.post(
        f"{API_PREFIX}/support/topics/{topic_id}/posts",
        json={"content": "Blocked reply"}
    )
    assert blocked_reply.status_code == 403
    assert "contact us" in blocked_reply.json()["detail"].lower()

    blocked_report = client.post(
        f"{API_PREFIX}/support/reports",
        json={"post_id": post_id, "reason": "Blocked report"}
    )
    assert blocked_report.status_code == 403
    assert "contact us" in blocked_report.json()["detail"].lower()

    app.dependency_overrides.clear()

def test_deleted_topics_disappear_from_public_reads(client, db_session, mock_user, mock_agent):
    from app.models.support import ForumTopic, ReportedContentStatus

    app.dependency_overrides[get_current_user] = lambda: mock_user
    topic_resp = client.post(
        f"{API_PREFIX}/support/topics",
        json={"title": "Delete me", "content": "This thread will be removed.", "category_id": mock_user.tmp_category_id}
    )
    topic_id = topic_resp.json()["id"]

    app.dependency_overrides[get_agent_user] = lambda: mock_agent
    delete_resp = client.delete(f"{API_PREFIX}/support/topics/{topic_id}")
    assert delete_resp.status_code == 200

    topics_resp = client.get(f"{API_PREFIX}/support/topics")
    assert topics_resp.status_code == 200
    assert all(topic["id"] != topic_id for topic in topics_resp.json())

    topic_resp = client.get(f"{API_PREFIX}/support/topics/{topic_id}")
    assert topic_resp.status_code == 404

    db_topic = db_session.query(ForumTopic).filter(ForumTopic.id == topic_id).first()
    assert db_topic is not None
    assert db_topic.is_deleted is True
    assert db_topic.deleted_at is not None

    app.dependency_overrides.clear()
