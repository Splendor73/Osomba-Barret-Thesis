from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import pytest
from app.main import app
from app.api.dependencies import get_current_user
from app.models.user import User, UserRole
from app.crud import user as crud_user
from app.schemas.user import UserUpdate

client = TestClient(app)

# --- Mock Data and Fixtures ---

# Using distinct cognito subs to avoid conflicts between tests
ADMIN_USER_SUB = "api-test-admin-sub-final"
NORMAL_USER_SUB = "api-test-normal-sub-final"
OTHER_USER_SUB = "api-test-other-sub-final"

@pytest.fixture()
def test_db_and_users(db_session: Session):
    """
    Fixture to create a set of users for the tests.
    Cleans up the users after all tests in the module are done.
    """
    admin = crud_user.create_user(db_session, email="api-admin-final@test.com", cognito_sub=ADMIN_USER_SUB, terms_version="v1")
    admin.role = UserRole.admin
    
    normal = crud_user.create_user(db_session, email="api-normal-final@test.com", cognito_sub=NORMAL_USER_SUB, terms_version="v1")
    
    other = crud_user.create_user(db_session, email="api-other-final@test.com", cognito_sub=OTHER_USER_SUB, terms_version="v1")

    db_session.commit()
    
    yield admin, normal, other

    # Teardown
    db_session.delete(admin)
    db_session.delete(normal)
    db_session.delete(other)
    db_session.commit()

def override_get_current_user(user: User):
    def override():
        return user
    return override

# --- Test Cases ---

def test_read_users_as_admin(test_db_and_users):
    """
    Test that an admin can retrieve a list of all users.
    """
    admin, _, _ = test_db_and_users
    app.dependency_overrides[get_current_user] = override_get_current_user(admin)
    response = client.get("/api/v1/users/")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert len(users) >= 3

def test_read_users_as_normal_user(test_db_and_users):
    """
    Test that a normal user gets a 403 Forbidden error when trying to list all users.
    """
    _, normal_user, _ = test_db_and_users
    app.dependency_overrides[get_current_user] = override_get_current_user(normal_user)
    response = client.get("/api/v1/users/")
    app.dependency_overrides.clear()
    
    assert response.status_code == 403

def test_read_user_by_id(test_db_and_users):
    """
    Test retrieving a single user by their ID.
    """
    _, normal_user, _ = test_db_and_users
    
    response = client.get(f"/api/v1/users/{normal_user.user_id}")

    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == normal_user.email
    assert user_data["user_id"] == normal_user.user_id

def test_update_own_user(test_db_and_users):
    """
    Test that a user can update their own profile.
    """
    _, normal_user, _ = test_db_and_users
    app.dependency_overrides[get_current_user] = override_get_current_user(normal_user)
    
    update_data = {"full_name": "Updated Name", "bio": "My new bio."}
    response = client.put(f"/api/v1/users/{normal_user.user_id}", json=update_data)
    app.dependency_overrides.clear()
    
    assert response.status_code == 200
    updated_user = response.json()
    assert updated_user["full_name"] == "Updated Name"
    assert updated_user["bio"] == "My new bio."

def test_update_other_user_as_normal_user(test_db_and_users):
    """
    Test that a normal user cannot update another user's profile.
    """
    admin, _, other_user = test_db_and_users
    app.dependency_overrides[get_current_user] = override_get_current_user(other_user)
    
    update_data = {"full_name": "Malicious Update"}
    response = client.put(f"/api/v1/users/{admin.user_id}", json=update_data)
    app.dependency_overrides.clear()
    
    assert response.status_code == 403

def test_update_other_user_as_admin(test_db_and_users):
    """
    Test that an admin can update another user's profile.
    """
    admin, normal_user, _ = test_db_and_users
    app.dependency_overrides[get_current_user] = override_get_current_user(admin)
    
    update_data = {"role": "SELLER"}
    response = client.put(f"/api/v1/users/{normal_user.user_id}", json=update_data)
    app.dependency_overrides.clear()
    
    assert response.status_code == 200
    updated_user = response.json()
    assert updated_user["role"] == "SELLER"

def test_delete_user_as_admin(test_db_and_users, db_session):
    """
    Test that an admin can delete a user.
    """
    admin, _, _ = test_db_and_users
    user_to_delete = crud_user.create_user(db_session, email="to_be_deleted@test.com", cognito_sub="delete_me", terms_version="v1")
    
    app.dependency_overrides[get_current_user] = override_get_current_user(admin)
    response = client.delete(f"/api/v1/users/{user_to_delete.user_id}")
    app.dependency_overrides.clear()
    
    assert response.status_code == 200
    
    # Verify the user is gone
    deleted_user = crud_user.get_user_by_id(db_session, user_id=user_to_delete.user_id)
    assert deleted_user is None

def test_delete_user_as_normal_user(test_db_and_users):
    """
    Test that a normal user cannot delete another user.
    """
    admin, normal_user, _ = test_db_and_users
    app.dependency_overrides[get_current_user] = override_get_current_user(normal_user)
    
    response = client.delete(f"/api/v1/users/{admin.user_id}")
    app.dependency_overrides.clear()
    
    assert response.status_code == 403
