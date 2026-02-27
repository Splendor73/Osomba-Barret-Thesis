from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Message(Base):
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    content = Column(Text, nullable=False)
    time_sent = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[sender_id], backref="messages_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], backref="messages_received")


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    notification_type = Column(String, nullable=False)  # 'email', 'phone', 'app'
    is_on = Column(Boolean, default=True)
    content = Column(Text)

    user = relationship("User", backref="notifications")


class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.product_id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    rating = Column(Integer, nullable=False)  # Check constraint 1-5 usually done in app or DB constraint
    comment = Column(Text)

    product = relationship("Product", backref="reviews")
    buyer = relationship("User", foreign_keys=[buyer_id], backref="reviews_written")
    seller = relationship("User", foreign_keys=[seller_id], backref="reviews_received")
