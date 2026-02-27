from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.crud import message as crud_message
from app.schemas import social as schemas
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=schemas.Message)
def create_message(
    *,
    db: Session = Depends(get_db),
    message_in: schemas.MessageCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Send a new message.
    """
    return crud_message.create_message(db=db, message=message_in, sender_id=current_user.user_id)

@router.get("/{other_user_id}", response_model=List[schemas.Message])
def read_messages(
    *,
    db: Session = Depends(get_db),
    other_user_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get messages between current user and another user.
    """
    return crud_message.get_messages_between_users(
        db=db, user1_id=current_user.user_id, user2_id=other_user_id, skip=skip, limit=limit
    )

@router.get("/one/{message_id}", response_model=schemas.Message)
def get_message_by_id_endpoint(
    *,
    db: Session = Depends(get_db),
    message_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a single message by its ID.
    """
    message = crud_message.get_message_by_id(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message.sender_id != current_user.user_id and message.receiver_id != current_user.user_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return message

@router.put("/{message_id}/read", response_model=schemas.Message)
def update_message_read_status(
    *,
    db: Session = Depends(get_db),
    message_id: int,
    is_read: bool = True,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update the read status of a message.
    """
    message = crud_message.get_message_by_id(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only the receiver or an admin can update the read status
    if message.receiver_id != current_user.user_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return crud_message.update_message_read_status(db=db, message_id=message_id, is_read=is_read)

@router.delete("/{message_id}", response_model=schemas.Message)
def delete_message_endpoint(
    *,
    db: Session = Depends(get_db),
    message_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a message. Only the sender or an admin can delete a message.
    """
    message = crud_message.get_message_by_id(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only the sender or an admin can delete the message
    if message.sender_id != current_user.user_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return crud_message.delete_message(db=db, message_id=message_id)

@router.get("/unread/count", response_model=int)
def get_unread_count(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get number of unread messages for current user.
    """
    return crud_message.get_unread_count(db=db, user_id=current_user.user_id)
