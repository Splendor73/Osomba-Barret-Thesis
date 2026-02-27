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

    def get_or_provision_user(
        self, 
        sub: str, 
        email: str, 
        terms_version: str | None = None, 
        marketing_opt_in: bool = False
    ) -> User:
        """
        Retrieves a user by Cognito SUB.
        If not found, attempts to re-link an orphaned email user.
        If no orphan exists, provisions a new JIT user (requires terms_version).
        """
        # 1. Try to find existing user by SUB
        user = self.db.query(User).filter(User.cognito_sub == sub).first()
        if user:
            return user

        # 2. Try to find orphaned user by Email
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

        # 3. Provision new JIT User
        if not terms_version:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="terms_version is required for initial user provisioning"
            )

        user = User(
            cognito_sub=sub,
            email=email,
            is_onboarded=False,
            accepted_terms_at=datetime.now(UTC),
            terms_version=terms_version,
            marketing_opt_in=marketing_opt_in
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
