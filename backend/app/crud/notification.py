from sqlalchemy.orm import Session
from app.models.social import Notification
from app.schemas.social import NotificationCreate

def get_notification_by_id(db: Session, notification_id: int):
    return db.query(Notification).filter(Notification.notification_id == notification_id).first()

def create_notification(db: Session, notification: NotificationCreate, user_id: int):
    db_notification = Notification(
        user_id=user_id,
        **notification.model_dump()
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.notification_id.desc()).offset(skip).limit(limit).all()

def update_notification_status(db: Session, notification_id: int, is_on: bool):
    notification = get_notification_by_id(db, notification_id)
    if notification:
        notification.is_on = is_on
        db.commit()
        db.refresh(notification)
    return notification

def delete_notification(db: Session, notification_id: int):
    notification = get_notification_by_id(db, notification_id)
    if notification:
        db.delete(notification)
        db.commit()
    return notification
