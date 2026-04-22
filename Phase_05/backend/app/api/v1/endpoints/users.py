from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import List

from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.security import verify_cognito_token
from app.crud import user as crud_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.support_access_service import get_effective_support_role

router = APIRouter()
security = HTTPBearer()

@router.get("/me")
def read_current_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Return the authenticated user's current profile plus resolved support role.
    """
    payload = verify_cognito_token(credentials.credentials)
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "user_name": current_user.user_name,
        "support_role": get_effective_support_role(db, current_user, payload) or "customer",
    }

@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve all users. Admin only.
    """
    if get_effective_support_role(db, current_user) != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    users = crud_user.get_all_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific user by ID.
    """
    db_user = crud_user.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user_endpoint(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a user. Users can only update their own profile unless they are an admin.
    """
    db_user = crud_user.get_user_by_id(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Authorization check
    if db_user.user_id != current_user.user_id and get_effective_support_role(db, current_user) != "admin":
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    user = crud_user.update_user(db=db, user_id=user_id, user_update=user_in)
    return user

@router.delete("/{user_id}", response_model=UserResponse)
def delete_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a user. Only admins can delete users.
    """
    if get_effective_support_role(db, current_user) != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions to delete a user")

    db_user = crud_user.get_user_by_id(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    deleted_user = crud_user.delete_user(db=db, user_id=user_id)
    return deleted_user
