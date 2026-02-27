import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, UTC
from app.main import app
from app.models.user import User
from app.api.dependencies import get_current_user

client = TestClient(app)

# Mock user data
MOCK_SUB = "test-sub-onboard-123"
MOCK_EMAIL = "onboard-test@osomba.com"

def mock_get_current_user(db: Session = pytest.fixture()):
    # Create or get user
    user = db.query(User).filter(User.cognito_sub == MOCK_SUB).first()
    if not user:
        user = User(
            cognito_sub=MOCK_SUB,
            email=MOCK_EMAIL,
            is_onboarded=False,
            accepted_terms_at=datetime.now(UTC),
            terms_version="2026-q1-v1"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@pytest.fixture
def override_auth(db_session):
    # Cleanup before test
    db_session.query(User).filter(User.cognito_sub == MOCK_SUB).delete()
    db_session.commit()
    
    def get_mock_user():
        user = db_session.query(User).filter(User.cognito_sub == MOCK_SUB).first()
        if not user:
            user = User(
                cognito_sub=MOCK_SUB,
                email=MOCK_EMAIL,
                is_onboarded=False,
                accepted_terms_at=datetime.now(UTC),
                terms_version="2026-q1-v1"
            )
            db_session.add(user)
            db_session.commit()
            db_session.refresh(user)
        return user
    
    app.dependency_overrides[get_current_user] = get_mock_user
    yield
    app.dependency_overrides.clear()
    
    # Cleanup after test
    db_session.query(User).filter(User.cognito_sub == MOCK_SUB).delete()
    db_session.commit()

def test_onboard_user_success(db_session, override_auth):
    onboard_data = {
        "full_name": "Test User",
        "user_name": "testuser123",
        "phone_number": "+1234567890",
        "address": "123 Main St",
        "city": "Nairobi",
        "country": "Kenya",
        "bio": "I am a test user.",
        "role": "BUYER"
    }
    
    response = client.post("/api/v1/auth/onboard", json=onboard_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Test User"
    assert data["is_onboarded"] is True
    assert data["city"] == "Nairobi"
    assert data["country"] == "Kenya"

def test_onboard_user_already_onboarded(db_session, override_auth):
    # First onboarding
    onboard_data = {
        "full_name": "Test User",
        "user_name": "testuser123",
        "phone_number": "+1234567890",
        "address": "123 Main St",
        "city": "Nairobi",
        "country": "Kenya",
        "bio": "I am a test user.",
        "role": "BUYER"
    }
    client.post("/api/v1/auth/onboard", json=onboard_data)
    
    # Second onboarding should fail
    response = client.post("/api/v1/auth/onboard", json=onboard_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "User is already onboarded"
