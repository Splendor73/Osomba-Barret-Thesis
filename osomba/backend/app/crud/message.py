from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.social import Message
from app.schemas.social import MessageCreate
from datetime import datetime, UTC

def get_message_by_id(db: Session, message_id: int):
    return db.query(Message).filter(Message.message_id == message_id).first()

def create_message(db: Session, message: MessageCreate, sender_id: int):
    db_message = Message(
        sender_id=sender_id,
        receiver_id=message.receiver_id,
        content=message.content,
        time_sent=datetime.now(UTC)
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_between_users(db: Session, user1_id: int, user2_id: int, skip: int = 0, limit: int = 100):
    return db.query(Message).filter(
        or_(
            and_(Message.sender_id == user1_id, Message.receiver_id == user2_id),
            and_(Message.sender_id == user2_id, Message.receiver_id == user1_id)
        )
    ).order_by(Message.time_sent.asc()).offset(skip).limit(limit).all()

def get_unread_count(db: Session, user_id: int):
    return db.query(Message).filter(
        Message.receiver_id == user_id,
        Message.is_read == False
    ).count()

def update_message_read_status(db: Session, message_id: int, is_read: bool):
    message = get_message_by_id(db, message_id)
    if message:
        message.is_read = is_read
        db.commit()
        db.refresh(message)
    return message

def delete_message(db: Session, message_id: int):
    message = get_message_by_id(db, message_id)
    if message:
        db.delete(message)
        db.commit()
    return message
