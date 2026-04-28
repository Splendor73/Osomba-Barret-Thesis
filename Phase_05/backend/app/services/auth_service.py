"""
File: services/auth_service.py
Purpose: Domain logic for Authentication and User Provisioning (JIT).
Architecture: Service Layer - Handles user lookup, re-linking, and creation.
"""
from datetime import datetime, UTC
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.crud import user as user_repo
from app.models.user import User

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    # Cognito sub is the stable identity link between AWS auth and our local User table.
    def get_or_provision_user(
        self, 
        sub: str, 
        email: str | None = None, 
        terms_version: str | None = None, 
        marketing_opt_in: bool = False
    ) -> User:
        """
        Retrieves a user by Cognito SUB.
        If not found, attempts to re-link an orphaned email user.
        If no orphan exists, provisions a new JIT user.
        """
        # Existing users take the fastest path by matching the stored Cognito sub.
        user = self.db.query(User).filter(User.cognito_sub == sub).first()
        if user:
            return user

        # Without email we cannot safely relink an orphan account or create a new profile.
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required for user provisioning. Please ensure your authentication token includes the email scope."
            )

        # Orphan relink handles users that existed before Cognito sub was saved.
        orphan = user_repo.get_user_by_email(self.db, email)
        if orphan:
            print(f"JIT: Re-linking existing user {email} to new sub {sub}")
            orphan.cognito_sub = sub
            
            # Update metadata if provided (optional for re-linking)
            if terms_version:
                orphan.terms_version = terms_version
                orphan.marketing_opt_in = marketing_opt_in
                orphan.accepted_terms_at = datetime.now(UTC)
                
            self.db.commit()
            self.db.refresh(orphan)
            return orphan

        # First authenticated request creates a local user row for app-owned data and roles.
        final_terms_version = terms_version or "1.0"

        user = User(
            cognito_sub=sub,
            email=email,
            is_onboarded=False,
            accepted_terms_at=datetime.now(UTC),
            terms_version=final_terms_version,
            marketing_opt_in=marketing_opt_in
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
