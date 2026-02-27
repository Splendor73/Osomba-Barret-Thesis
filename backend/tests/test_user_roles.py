import pytest
from sqlalchemy.orm import Session
from sqlalchemy.exc import DataError, StatementError
from app.models.user import User, UserRole
from datetime import datetime, UTC

def test_user_role_enum_enforcement(db_session: Session):
    """
    Verify that only valid UserRole enum values are accepted by the database.
    """
    test_email = "role-test@example.com"
    
    # Clean up if exists
    existing = db_session.query(User).filter(User.email == test_email).first()
    if existing:
        db_session.delete(existing)
        db_session.commit()

    # 1. Valid Role
    valid_user = User(
        email=test_email,
        cognito_sub="sub-role-valid",
        role=UserRole.BUYER,
        terms_version="v1",
        accepted_terms_at=datetime.now(UTC)
    )
    db_session.add(valid_user)
    db_session.commit()
    assert valid_user.role == UserRole.BUYER

    # 2. Invalid Role (should raise an error)
    # Note: SQLAlchemy Enums usually raise LookupError or similar during assignment 
    # if it's a strict Enum, or the DB raises error on commit.
    invalid_user = User(
        email="invalid-role@example.com",
        cognito_sub="sub-role-invalid",
    )
    try:
        with pytest.raises((ValueError, StatementError, DataError, LookupError)):
            invalid_user.role = "INVALID_ROLE_STRING" # Type checkers or SQLAlchemy might catch this
            db_session.add(invalid_user)
            db_session.commit()
    except Exception:
        db_session.rollback()
        raise
    finally:
        db_session.rollback() # Ensure session state is clean before we use it again
            
    # Teardown valid_user by requerying to avoid DetachedInstanceError or ObjectDeletedError
    valid_td = db_session.query(User).filter(User.email == test_email).first()
    if valid_td:
        db_session.delete(valid_td)
        db_session.commit()
