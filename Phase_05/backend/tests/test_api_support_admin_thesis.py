import pytest
from app.main import app
from app.api.dependencies import get_admin_user, get_agent_user
from app.core.config import settings
from app.models.user import User
from app.models.order import Order, Payment
from app.models.support import ForumPost, ForumTopic

API_PREFIX = f"{settings.SUPPORT_API_PREFIX}{settings.API_V1_STR}"

@pytest.fixture
def mock_admin(db_session):
    from datetime import datetime
    admin = User(
        user_id=1007,
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

def test_support_context_as_admin(client, db_session, mock_admin):
    from datetime import datetime
    app.dependency_overrides[get_admin_user] = lambda: mock_admin
    app.dependency_overrides[get_agent_user] = lambda: mock_admin
    
    # Create a user to query
    customer = User(
        user_id=1008,
        email="customer2@example.com",
        full_name="Cust Omer",
        role="BUYER",
        country="DRC",
        accepted_terms_at=datetime.utcnow(),
        terms_version="1.0"
    )
    db_session.add(customer)
    db_session.commit()
    
    # Create some mock orders and topics so the context returns data
    order = Order(order_id=999, buyer_id=1008, total_cost=45.0, shipping_type="Standard", shipping_status="Pending")
    db_session.add(order)
    db_session.commit()
    
    payment = Payment(payment_id=999, order_id=999, payment_status="FAILED", payment_amount=45.0, currency="USD", payment_type="MPESA")
    db_session.add(payment)
    db_session.commit()
    
    from app.models.support import ForumCategory
    category = db_session.query(ForumCategory).filter_by(name="General").first()
    if not category:
        category = ForumCategory(name="General", description="General discussions")
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)
    cat_id = category.id
    
    topic = ForumTopic(title="Help me with #999", content="Failed payment", user_id=1008, category_id=cat_id, is_locked=False)
    db_session.add(topic)
    db_session.commit()
    
    try:
        response = client.get(f"{API_PREFIX}/admin/users/1008/support-context")
        assert response.status_code == 200
        data = response.json()
        
        assert data["user_id"] == 1008
        assert data["email"] == "customer2@example.com"
        assert data["total_orders"] == 1
        assert data["failed_payments"] == 1
        assert data["past_forum_posts"] == 1
        assert len(data["recent_orders"]) == 1
    finally:
        app.dependency_overrides.clear()

def test_agent_can_review_reports_delete_content_and_block_user(client, db_session, mock_admin):
    from datetime import datetime
    from app.api.dependencies import get_current_user
    from app.models.support import ForumCategory, ReportedContent, ReportedContentStatus
    import app.api.v1.endpoints.admin as admin_mod

    app.dependency_overrides[get_admin_user] = lambda: mock_admin
    app.dependency_overrides[get_agent_user] = lambda: mock_admin

    abusive_user = User(
        user_id=1010,
        email="abusive@example.com",
        full_name="Abusive User",
        role="BUYER",
        accepted_terms_at=datetime.utcnow(),
        terms_version="1.0"
    )
    reporter = User(
        user_id=1011,
        email="reporter@example.com",
        full_name="Reporter",
        role="BUYER",
        accepted_terms_at=datetime.utcnow(),
        terms_version="1.0"
    )
    db_session.add_all([abusive_user, reporter])
    db_session.commit()

    category = db_session.query(ForumCategory).filter_by(name="General").first()
    if not category:
        category = ForumCategory(name="General", description="General discussions")
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

    topic = ForumTopic(
        title="Reported thread",
        content="This thread is abusive",
        user_id=abusive_user.user_id,
        category_id=category.id,
        is_locked=False
    )
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)

    post = ForumPost(
        topic_id=topic.id,
        user_id=abusive_user.user_id,
        content="This reply should be moderated"
    )
    db_session.add(post)
    db_session.commit()
    db_session.refresh(post)

    app.dependency_overrides[get_current_user] = lambda: reporter
    report_resp = client.post(
        f"{API_PREFIX}/support/reports",
        json={"post_id": post.id, "reason": "Abuse"}
    )
    assert report_resp.status_code == 200

    reports_resp = client.get(f"{API_PREFIX}/admin/reports")
    assert reports_resp.status_code == 200
    report = reports_resp.json()[0]
    assert report["content_type"] == "post"
    assert report["content_author_id"] == abusive_user.user_id
    assert report["content_author_email"] == abusive_user.email
    assert report["content_deleted"] is False
    report_id = report["id"]

    dismiss_resp = client.post(f"{API_PREFIX}/admin/reports/{report_id}/dismiss")
    assert dismiss_resp.status_code == 200

    stored_report = db_session.query(ReportedContent).filter(ReportedContent.id == report_id).first()
    db_session.refresh(stored_report)
    assert stored_report.status == ReportedContentStatus.DISMISSED

    stored_report.status = ReportedContentStatus.PENDING
    db_session.commit()

    delete_resp = client.post(f"{API_PREFIX}/admin/reports/{report_id}/delete-content")
    assert delete_resp.status_code == 200

    db_session.refresh(post)
    stored_report = db_session.query(ReportedContent).filter(ReportedContent.id == report_id).first()
    assert post.is_deleted is True
    assert post.deleted_at is not None
    assert stored_report.status == ReportedContentStatus.DELETED

    original_send = admin_mod.send_notification_email if hasattr(admin_mod, "send_notification_email") else None
    calls = []
    admin_mod.send_notification_email = lambda to_email, subject, html: calls.append((to_email, subject, html)) or True
    try:
        block_resp = client.post(f"{API_PREFIX}/admin/users/{abusive_user.user_id}/block")
        assert block_resp.status_code == 200
        db_session.refresh(abusive_user)
        assert abusive_user.is_banned is True
        assert len(calls) == 1
        assert "support@osomba.com" in calls[0][2]
        assert "+1 800 500 0011" in calls[0][2]
    finally:
        if original_send is not None:
            admin_mod.send_notification_email = original_send

    app.dependency_overrides.clear()
