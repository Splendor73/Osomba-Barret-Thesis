from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserOnboard, UserJitCreate
from app.api.dependencies import get_current_user
from app.crud import user as user_crud

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.
    """
    return current_user


@router.post("/me", response_model=UserResponse)
async def create_or_get_user_me(
    jit_data: UserJitCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint for initial JIT provisioning or getting current profile.
    The JIT logic is actually handled in the dependency, which will use the jit_data
    if the user doesn't exist yet.
    """
    return current_user


@router.post("/onboard", response_model=UserResponse)
def onboard_user(
    onboard_data: UserOnboard,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Complete the onboarding process for the current user.
    """
    if current_user.is_onboarded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already onboarded",
        )
    return user_crud.onboard_user(db, current_user, onboard_data)
