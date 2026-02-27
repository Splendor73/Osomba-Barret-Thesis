from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.crud import notification as crud_notification
from app.schemas import social as schemas
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas.Notification])
def read_notifications(
    *,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user's notifications.
    """
    return crud_notification.get_user_notifications(
        db=db, user_id=current_user.user_id, skip=skip, limit=limit
    )

@router.put("/{notification_id}", response_model=schemas.Notification)
def update_notification_status_endpoint(
    *,
    db: Session = Depends(get_db),
    notification_id: int,
    is_on: bool,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update the 'is_on' status of a notification.
    """
    # First, check if the notification exists and belongs to the current user
    notification = crud_notification.get_notification_by_id(db, notification_id) # Need to add this CRUD function
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Only the owner or an admin can update the notification
    if notification.user_id != current_user.user_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return crud_notification.update_notification_status(db=db, notification_id=notification_id, is_on=is_on)

@router.delete("/{notification_id}", response_model=schemas.Notification)
def delete_notification_endpoint(
    *,
    db: Session = Depends(get_db),
    notification_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a notification.
    """
    # First, check if the notification exists and belongs to the current user
    notification = crud_notification.get_notification_by_id(db, notification_id) # Need to add this CRUD function
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Only the owner or an admin can delete the notification
    if notification.user_id != current_user.user_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return crud_notification.delete_notification(db=db, notification_id=notification_id)
