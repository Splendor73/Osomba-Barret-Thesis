import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.user import User
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException, Request

client = TestClient(app)

def test_verify_cognito_token_missing_kid():
    from app.core.security import verify_cognito_token
    # Mock jwt.get_unverified_header to return header without kid
    with patch("jose.jwt.get_unverified_header", return_value={}):
        with pytest.raises(HTTPException) as exc:
            verify_cognito_token("fake-token")
        assert exc.value.status_code == 401
        assert "missing kid" in exc.value.detail

def test_verify_cognito_token_invalid_kid():
    from app.core.security import verify_cognito_token
    # Mock JWKS and header
    mock_jwks = {"keys": [{"kid": "valid-kid"}]}
    with patch("jose.jwt.get_unverified_header", return_value={"kid": "invalid-kid"}):
        with patch("app.core.security.get_jwks", return_value=mock_jwks):
            with pytest.raises(HTTPException) as exc:
                verify_cognito_token("fake-token")
            assert exc.value.status_code == 401
            assert "kid not found" in exc.value.detail

@pytest.mark.anyio
async def test_jit_provisioning_missing_sub():
    from app.api.dependencies import get_current_user
    mock_credentials = MagicMock()
    mock_credentials.credentials = "fake-token"
    
    # Mock Request
    mock_request = MagicMock(spec=Request)
    
    # Mock verify_cognito_token to return payload without sub
    with patch("app.api.dependencies.verify_cognito_token", return_value={"email": "test@test.com"}):
        with pytest.raises(HTTPException) as exc:
            await get_current_user(mock_request, mock_credentials, MagicMock())
        assert exc.value.status_code == 401

@pytest.mark.anyio
@patch("app.api.dependencies.verify_cognito_token")
async def test_jit_provisioning_database_error(mock_verify, db_session):
    from app.api.dependencies import get_current_user
    mock_verify.return_value = {"sub": "error-sub", "email": "error@test.com"}
    
    mock_credentials = MagicMock()
    mock_credentials.credentials = "fake-token"
    
    # Mock Request with body
    mock_request = MagicMock(spec=Request)
    mock_request.body = AsyncMock(return_value=b'{"terms_version": "v1"}')
    mock_request.json = AsyncMock(return_value={"terms_version": "v1"})
    
    # Mock DB session to raise an exception on add
    mock_db = MagicMock(spec=Session)
    mock_db.query.return_value.filter.return_value.first.return_value = None
    mock_db.add.side_effect = Exception("DB Connection Lost")
    
    with pytest.raises(HTTPException) as exc:
        await get_current_user(mock_request, mock_credentials, mock_db)
    
    assert exc.value.status_code == 500
    assert "Authentication failed during provisioning:" in exc.value.detail

def test_jit_idempotency_race_condition(db_session: Session):
    """
    Test that even if multiple requests try to provision the same user,
    the second request safely retrieves the existing user instead of failing.
    """
    test_sub = "race-sub-123"
    test_email = "race@example.com"
    
    # Ensure user doesn't exist
    user = db_session.query(User).filter(User.cognito_sub == test_sub).first()
    if user:
        db_session.delete(user)
        db_session.commit()

    mock_payload = {"sub": test_sub, "email": test_email}
    jit_payload = {"terms_version": "2026-q1-v1", "marketing_opt_in": True}
    
    with patch("app.api.dependencies.verify_cognito_token", return_value=mock_payload):
        # First call provisions the user (needs body)
        resp1 = client.post("/api/v1/auth/me", json=jit_payload, headers={"Authorization": "Bearer tok"})
        assert resp1.status_code == 200
        
        # Second call should find the existing user (doesn't need body)
        resp2 = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer tok"})
        assert resp2.status_code == 200
        
        # Verify only one user exists in DB
        users = db_session.query(User).filter(User.cognito_sub == test_sub).all()
        assert len(users) == 1

    # Cleanup
    db_session.delete(users[0])
    db_session.commit()
