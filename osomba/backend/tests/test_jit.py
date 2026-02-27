import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from unittest.mock import patch
from datetime import datetime, UTC

def test_jit_provisioning_flow(client, db_session: Session):
    # Test data
    test_sub = "test-jit-sub-uuid-999"
    test_email = "jit-tester@example.com"
    
    # No manual cleanup needed - db_session fixture handles rollback

    # Mock Cognito verification
    mock_payload = {
        "sub": test_sub,
        "email": test_email,
        "email_verified": True
    }

    with patch("app.api.dependencies.verify_cognito_token", return_value=mock_payload):
        # 1. GET /me for a non-existent user should FAIL
        # Note: If JIT is enabled on GET, this might succeed. Assuming implementation requires explicit signup or specific flow.
        # Based on previous test, it expects 400 if terms_version missing.
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer mock-token-123"}
        )
        assert response.status_code == 400
        assert "terms_version is required" in response.json()["detail"]

        # 2. POST /me with JIT data should SUCCESS
        jit_payload = {
            "terms_version": "2026-q1-v1",
            "marketing_opt_in": True
        }
        response = client.post(
            "/api/v1/auth/me",
            json=jit_payload,
            headers={"Authorization": "Bearer mock-token-123"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_email
        assert data["terms_version"] == "2026-q1-v1"
        assert data["marketing_opt_in"] is True
        
        # 3. Verify user was actually created in DB
        db_user = db_session.query(User).filter(User.cognito_sub == test_sub).first()
        assert db_user is not None
        assert db_user.email == test_email
        initial_terms_at = db_user.accepted_terms_at

        # 4. Idempotency Check: POST /me again with DIFFERENT data
        # It should return the EXISTING user and NOT update the fields (JIT is for creation only)
        jit_payload_retry = {
            "terms_version": "new-version-should-be-ignored",
            "marketing_opt_in": False
        }
        response_retry = client.post(
            "/api/v1/auth/me",
            json=jit_payload_retry,
            headers={"Authorization": "Bearer mock-token-123"}
        )
        assert response_retry.status_code == 200
        data_retry = response_retry.json()
        assert data_retry["terms_version"] == "2026-q1-v1" # Kept original
        assert data_retry["marketing_opt_in"] is True     # Kept original
        
        db_user_refresh = db_session.query(User).filter(User.cognito_sub == test_sub).first()
        assert db_user_refresh.accepted_terms_at == initial_terms_at

def test_jit_relinking_orphaned_email(client, db_session: Session):
    """Verify that JIT re-links a record if the email exists but sub is new."""
    test_email = "relink-tester@example.com"
    old_sub = "old-sub-123"
    new_sub = "new-sub-456"
    
    # 1. Create an "orphaned" record in DB
    orphaned = User(
        email=test_email,
        cognito_sub=old_sub,
        terms_version="old-v",
        accepted_terms_at=datetime.now(UTC)
    )
    db_session.add(orphaned)
    db_session.commit() # This commit is local to the transaction, rolled back after test

    # 2. Mock token with NEW sub
    mock_payload = {"sub": new_sub, "email": test_email}

    with patch("app.api.dependencies.verify_cognito_token", return_value=mock_payload):
        # Call /me with new JIT data
        jit_payload = {"terms_version": "new-v", "marketing_opt_in": True}
        response = client.post(
            "/api/v1/auth/me",
            json=jit_payload,
            headers={"Authorization": "Bearer token"}
        )
        
        assert response.status_code == 200
        
        # 3. Verify record was UPDATED not DUPLICATED
        db_user = db_session.query(User).filter(User.email == test_email).one()
        assert db_user.cognito_sub == new_sub
        assert db_user.terms_version == "new-v"

def test_jit_validation_failure(client, db_session: Session):
    """Verify 400 when body is invalid during JIT."""
    test_sub = "test-fail-sub-uuid"
    mock_payload = {"sub": test_sub, "email": "fail@example.com"}

    with patch("app.api.dependencies.verify_cognito_token", return_value=mock_payload):
        # Missing terms_version
        response = client.post(
            "/api/v1/auth/me",
            json={"marketing_opt_in": True}, 
            headers={"Authorization": "Bearer token"}
        )
        assert response.status_code == 400
        assert "terms_version is required" in response.json()["detail"]
