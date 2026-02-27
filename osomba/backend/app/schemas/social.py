from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

# --- MESSAGE SCHEMAS ---
class MessageBase(BaseModel):
    content: str
    receiver_id: int

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    message_id: int
    sender_id: int
    time_sent: datetime
    is_read: bool = False

    model_config = ConfigDict(from_attributes=True)

# --- NOTIFICATION SCHEMAS ---
class NotificationBase(BaseModel):
    content: str
    notification_type: str = 'app' # 'email', 'phone', 'app'

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    notification_id: int
    user_id: int
    is_on: bool = True

    model_config = ConfigDict(from_attributes=True)

# --- REVIEW SCHEMAS ---
class ReviewBase(BaseModel):
    rating: int # Add validation later (1-5)
    comment: Optional[str] = None
    product_id: int

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None

class Review(ReviewBase):
    review_id: int
    buyer_id: int
    seller_id: int

    model_config = ConfigDict(from_attributes=True)
