import pytest
from app.main import app
from app.api.dependencies import get_admin_user, get_agent_user
from app.models.user import User
from app.models.order import Order, Payment
from app.models.support import ForumTopic

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
        response = client.get(f"/api/v1/admin/users/1008/support-context")
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
