from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import pytest
from app.main import app
from app.api.dependencies import get_current_user
from app.models.user import User, UserRole
from app.crud import user as crud_user
from app.crud import notification as crud_notification
from app.schemas.social import NotificationCreate

client = TestClient(app)

# --- Mock Data and Fixtures ---

NOTIFICATION_OWNER_SUB = "api-notification-owner-sub"
NOTIFICATION_ADMIN_SUB = "api-notification-admin-sub"
NOTIFICATION_OTHER_SUB = "api-notification-other-sub"

@pytest.fixture()
def test_users_for_notifications(db_session: Session):
    """
    Fixture to create owner, admin, and other users for notification tests.
    """
    owner = crud_user.create_user(db_session, email="notification_owner@test.com", cognito_sub=NOTIFICATION_OWNER_SUB, terms_version="v1")
    owner.is_onboarded = True
    
    admin = crud_user.create_user(db_session, email="notification_admin@test.com", cognito_sub=NOTIFICATION_ADMIN_SUB, terms_version="v1")
    admin.role = UserRole.admin
    admin.is_onboarded = True

    other = crud_user.create_user(db_session, email="notification_other@test.com", cognito_sub=NOTIFICATION_OTHER_SUB, terms_version="v1")
    other.is_onboarded = True
    
    db_session.commit()
    
    yield owner, admin, other

    # Teardown
    db_session.delete(owner)
    db_session.delete(admin)
    db_session.delete(other)
    db_session.commit()

@pytest.fixture()
def authorized_owner_client(test_users_for_notifications):
    """
    Client authenticated as the notification owner.
    """
    owner, _, _ = test_users_for_notifications
    def override_dependency():
        return owner
    app.dependency_overrides[get_current_user] = override_dependency
    yield client
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_admin_client_notification(test_users_for_notifications):
    """
    Client authenticated as an admin.
    """
    _, admin, _ = test_users_for_notifications
    def override_dependency():
        return admin
    app.dependency_overrides[get_current_user] = override_dependency
    yield client
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_other_client_notification(test_users_for_notifications):
    """
    Client authenticated as another user.
    """
    _, _, other = test_users_for_notifications
    def override_dependency():
        return other
    app.dependency_overrides[get_current_user] = override_dependency
    yield client
    app.dependency_overrides.clear()

@pytest.fixture()
def test_notification(db_session: Session, test_users_for_notifications):
    """
    Fixture to create a notification for testing.
    """
    owner, _, _ = test_users_for_notifications
    notification_data = NotificationCreate(content="Your auction has ended.", notification_type="app")
    notification = crud_notification.create_notification(db_session, notification=notification_data, user_id=owner.user_id)
    db_session.refresh(notification)
    yield notification
    crud_notification.delete_notification(db_session, notification_id=notification.notification_id)

# --- Test Cases ---

def test_read_notifications_success(test_notification, authorized_owner_client: TestClient):
    """
    Test retrieving notifications for the current user.
    """
    response = authorized_owner_client.get("/api/v1/notifications/")
    assert response.status_code == 200
    notifications = response.json()
    assert isinstance(notifications, list)
    assert any(n["notification_id"] == test_notification.notification_id for n in notifications)

def test_update_notification_status_as_owner(test_notification, authorized_owner_client: TestClient):
    """
    Test updating a notification's status by its owner.
    """
    response = authorized_owner_client.put(f"/api/v1/notifications/{test_notification.notification_id}", params={"is_on": False})
    assert response.status_code == 200
    updated_notification = response.json()
    assert updated_notification["notification_id"] == test_notification.notification_id
    assert updated_notification["is_on"] is False

def test_update_notification_status_unauthorized(test_notification, authorized_other_client_notification: TestClient):
    """
    Test updating a notification's status by an unauthorized user.
    """
    response = authorized_other_client_notification.put(f"/api/v1/notifications/{test_notification.notification_id}", params={"is_on": False})
    assert response.status_code == 403

def test_delete_notification_as_owner(test_users_for_notifications, db_session: Session, authorized_owner_client: TestClient):
    """
    Test deleting a notification by its owner.
    """
    owner, _, _ = test_users_for_notifications
    notification_data = NotificationCreate(content="To be deleted.", notification_type="app")
    notification = crud_notification.create_notification(db_session, notification=notification_data, user_id=owner.user_id)
    
    response = authorized_owner_client.delete(f"/api/v1/notifications/{notification.notification_id}")
    assert response.status_code == 200
    deleted_notification = response.json()
    assert deleted_notification["notification_id"] == notification.notification_id
    
    # Verify it's gone
    retrieved = crud_notification.get_notification_by_id(db_session, notification.notification_id)
    assert retrieved is None

def test_delete_notification_as_admin(test_users_for_notifications, db_session: Session, authorized_admin_client_notification: TestClient):
    """
    Test deleting a notification by an admin.
    """
    owner, _, _ = test_users_for_notifications
    notification_data = NotificationCreate(content="Admin deletion test.", notification_type="app")
    notification = crud_notification.create_notification(db_session, notification=notification_data, user_id=owner.user_id)

    response = authorized_admin_client_notification.delete(f"/api/v1/notifications/{notification.notification_id}")
    assert response.status_code == 200

def test_delete_notification_unauthorized(test_notification, authorized_other_client_notification: TestClient):
    """
    Test deleting a notification by an unauthorized user.
    """
    response = authorized_other_client_notification.delete(f"/api/v1/notifications/{test_notification.notification_id}")
    assert response.status_code == 403
