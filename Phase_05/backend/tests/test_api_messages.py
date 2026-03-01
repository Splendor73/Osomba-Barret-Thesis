from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import or_
import pytest
from app.main import app
from app.api.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.social import Message
from app.crud import user as crud_user
from app.crud import message as crud_message
from app.schemas.social import MessageCreate

client = TestClient(app)

# --- Mock Data and Fixtures ---

MESSAGE_SENDER_SUB = "api-msg-sender-sub"
MESSAGE_RECEIVER_SUB = "api-msg-receiver-sub"
MESSAGE_ADMIN_SUB = "api-msg-admin-sub"
MESSAGE_OTHER_SUB = "api-msg-other-sub"

@pytest.fixture()
def test_users_for_messages(db_session: Session):
    """
    Fixture to create sender, receiver, admin, and other users for message tests.
    """
    subs_to_clean = [MESSAGE_SENDER_SUB, MESSAGE_RECEIVER_SUB, MESSAGE_ADMIN_SUB, MESSAGE_OTHER_SUB]

    def clean_up():
        users = db_session.query(User).filter(User.cognito_sub.in_(subs_to_clean)).all()
        if not users:
            return
            
        user_ids = [u.user_id for u in users]
        
        # 1. Clean up ALL messages sent OR received by these test users
        db_session.query(Message).filter(
            or_(
                Message.sender_id.in_(user_ids),
                Message.receiver_id.in_(user_ids)
            )
        ).delete(synchronize_session=False)

        # 2. Finally, safely delete the users
        db_session.query(User).filter(User.user_id.in_(user_ids)).delete(synchronize_session=False)
        db_session.commit()

    # Pre-test cleanup just in case
    clean_up()

    sender = crud_user.create_user(db_session, email="msg_sender@test.com", cognito_sub=MESSAGE_SENDER_SUB, terms_version="v1", marketing_opt_in=False)
    sender.role = UserRole.BUYER
    sender.is_onboarded = True
    
    receiver = crud_user.create_user(db_session, email="msg_receiver@test.com", cognito_sub=MESSAGE_RECEIVER_SUB, terms_version="v1", marketing_opt_in=False)
    receiver.role = UserRole.BUYER
    receiver.is_onboarded = True

    admin = crud_user.create_user(db_session, email="msg_admin@test.com", cognito_sub=MESSAGE_ADMIN_SUB, terms_version="v1", marketing_opt_in=False)
    admin.role = UserRole.admin
    admin.is_onboarded = True

    other = crud_user.create_user(db_session, email="msg_other@test.com", cognito_sub=MESSAGE_OTHER_SUB, terms_version="v1", marketing_opt_in=False)
    other.role = UserRole.BUYER
    other.is_onboarded = True
    
    db_session.commit()
    
    # Refresh to ensure we have the IDs
    db_session.refresh(sender)
    db_session.refresh(receiver)
    db_session.refresh(admin)
    db_session.refresh(other)
    
    yield sender, receiver, admin, other

    # Post-test cleanup (replaces individual db_session.delete calls)
    clean_up()

@pytest.fixture()
def authorized_sender_client(test_users_for_messages):
    """
    Client authenticated as the message sender.
    """
    sender, _, _, _ = test_users_for_messages
    def override_dependency():
        return sender
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_receiver_client(test_users_for_messages):
    """
    Client authenticated as the message receiver.
    """
    _, receiver, _, _ = test_users_for_messages
    def override_dependency():
        return receiver
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_admin_client_message(test_users_for_messages):
    """
    Client authenticated as an admin.
    """
    _, _, admin, _ = test_users_for_messages
    def override_dependency():
        return admin
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_other_client_message(test_users_for_messages):
    """
    Client authenticated as another user.
    """
    _, _, _, other = test_users_for_messages
    def override_dependency():
        return other
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def test_message(test_users_for_messages, db_session: Session):
    """
    Fixture to create a message for testing. Cleans up after the test.
    """
    sender, receiver, _, _ = test_users_for_messages
    message_data = MessageCreate(content="Hello there!", receiver_id=receiver.user_id)
    created_message = crud_message.create_message(db_session, message=message_data, sender_id=sender.user_id)
    db_session.refresh(created_message)
    yield created_message
    crud_message.delete_message(db_session, message_id=created_message.message_id)


# --- Test Cases ---

def test_create_message_success(test_users_for_messages, authorized_sender_client: TestClient):
    """
    Test creating a message successfully.
    """
    _, receiver, _, _ = test_users_for_messages
    message_data = {"content": "Test message content", "receiver_id": receiver.user_id}
    response = authorized_sender_client.post("/api/v1/messages/", json=message_data)
    assert response.status_code == 200
    created_message = response.json()
    assert created_message["content"] == message_data["content"]
    assert created_message["sender_id"] == authorized_sender_client.app.dependency_overrides[get_current_user]().user_id
    assert created_message["receiver_id"] == receiver.user_id
    assert created_message["is_read"] is False

def test_get_messages_between_users(test_users_for_messages, test_message: Message, client: TestClient):
    """
    Test retrieving messages between two users.
    """
    sender, receiver, _, _ = test_users_for_messages
    
    # Sender reads messages
    app.dependency_overrides[get_current_user] = lambda: sender
    response_sender = client.get(f"/api/v1/messages/{receiver.user_id}")
    del app.dependency_overrides[get_current_user]
    assert response_sender.status_code == 200
    messages_from_sender = response_sender.json()
    assert isinstance(messages_from_sender, list)
    assert any(m["message_id"] == test_message.message_id for m in messages_from_sender)

    # Receiver reads messages
    app.dependency_overrides[get_current_user] = lambda: receiver
    response_receiver = client.get(f"/api/v1/messages/{sender.user_id}")
    del app.dependency_overrides[get_current_user]
    assert response_receiver.status_code == 200
    messages_from_receiver = response_receiver.json()
    assert isinstance(messages_from_receiver, list)
    assert any(m["message_id"] == test_message.message_id for m in messages_from_receiver)

def test_update_message_read_status_success(test_message: Message, authorized_receiver_client: TestClient):
    """
    Test updating message read status by receiver.
    """
    response = authorized_receiver_client.put(f"/api/v1/messages/{test_message.message_id}/read", json={"is_read": True})
    assert response.status_code == 200
    updated_message = response.json()
    assert updated_message["message_id"] == test_message.message_id
    assert updated_message["is_read"] is True

def test_update_message_read_status_unauthorized(test_message: Message, authorized_other_client_message: TestClient):
    """
    Test updating message read status by an unauthorized user.
    """
    response = authorized_other_client_message.put(f"/api/v1/messages/{test_message.message_id}/read", json={"is_read": True})
    assert response.status_code == 403

def test_get_unread_count(test_users_for_messages, db_session: Session, authorized_receiver_client: TestClient):
    """
    Test retrieving unread message count.
    """
    # Create an unread message for the receiver
    sender, receiver, _, _ = test_users_for_messages
    message_data = MessageCreate(content="Unread test", receiver_id=receiver.user_id)
    unread_message = crud_message.create_message(db_session, message=message_data, sender_id=sender.user_id)

    response = authorized_receiver_client.get("/api/v1/messages/unread/count")
    assert response.status_code == 200
    count = response.json()
    assert count >= 1 # At least the one we just created
    
    # Mark it read and check again
    crud_message.update_message_read_status(db_session, unread_message.message_id, True)
    response = authorized_receiver_client.get("/api/v1/messages/unread/count")
    assert response.status_code == 200
    new_count = response.json()
    assert new_count == (count - 1) if count > 0 else 0

def test_delete_message_success(test_message: Message, authorized_sender_client: TestClient):
    """
    Test deleting a message by the sender.
    """
    response = authorized_sender_client.delete(f"/api/v1/messages/{test_message.message_id}")
    assert response.status_code == 200
    deleted_message = response.json()
    assert deleted_message["message_id"] == test_message.message_id
    
    # Verify it's actually deleted
    response = authorized_sender_client.get(f"/api/v1/messages/one/{test_message.message_id}")
    assert response.status_code == 404

def test_delete_message_as_admin(test_users_for_messages, db_session: Session, authorized_admin_client_message: TestClient):
    """
    Test deleting a message by an admin.
    """
    sender, receiver, _, _ = test_users_for_messages
    message_data = MessageCreate(content="Admin delete test", receiver_id=receiver.user_id)
    message_to_delete = crud_message.create_message(db_session, message=message_data, sender_id=sender.user_id)

    response = authorized_admin_client_message.delete(f"/api/v1/messages/{message_to_delete.message_id}")
    assert response.status_code == 200
    deleted_message = response.json()
    assert deleted_message["message_id"] == message_to_delete.message_id

def test_delete_message_unauthorized(test_message: Message, authorized_other_client_message: TestClient):
    """
    Test deleting a message by an unauthorized user.
    """
    response = authorized_other_client_message.delete(f"/api/v1/messages/{test_message.message_id}")
    assert response.status_code == 403

def test_get_message_by_id_as_sender(test_message: Message, authorized_sender_client: TestClient):
    """
    Test getting a single message by its ID, authenticated as the sender.
    """
    response = authorized_sender_client.get(f"/api/v1/messages/one/{test_message.message_id}")
    assert response.status_code == 200
    message_data = response.json()
    assert message_data["message_id"] == test_message.message_id
    assert message_data["content"] == test_message.content
    assert message_data["sender_id"] == test_message.sender_id

def test_get_message_by_id_as_receiver(test_message: Message, authorized_receiver_client: TestClient):
    """
    Test getting a single message by its ID, authenticated as the receiver.
    """
    response = authorized_receiver_client.get(f"/api/v1/messages/one/{test_message.message_id}")
    assert response.status_code == 200
    message_data = response.json()
    assert message_data["message_id"] == test_message.message_id
    assert message_data["content"] == test_message.content

def test_get_message_by_id_as_admin(test_message: Message, authorized_admin_client_message: TestClient):
    """
    Test getting a single message by its ID, authenticated as an admin.
    """
    response = authorized_admin_client_message.get(f"/api/v1/messages/one/{test_message.message_id}")
    assert response.status_code == 200
    message_data = response.json()
    assert message_data["message_id"] == test_message.message_id

def test_get_message_by_id_unauthorized(test_message: Message, authorized_other_client_message: TestClient):
    """
    Test that an unrelated user cannot get a message.
    """
    response = authorized_other_client_message.get(f"/api/v1/messages/one/{test_message.message_id}")
    assert response.status_code == 403

def test_get_message_by_id_not_found(authorized_sender_client: TestClient):
    """
    Test getting a message that does not exist.
    """
    non_existent_id = 999999
    response = authorized_sender_client.get(f"/api/v1/messages/one/{non_existent_id}")
    assert response.status_code == 404
