import enum
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.db.database import Base
from app.models.user import User


class SupportTicketStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class SupportTicketPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ForumCategory(Base):
    __tablename__ = "forum_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    topics = relationship("ForumTopic", back_populates="category", cascade="all, delete-orphan")


class ForumTopic(Base):
    __tablename__ = "forum_topics"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("forum_categories.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    
    # 384 dimensions for all-MiniLM-L6-v2 Semantic Search
    embedding = Column(Vector(384), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("ForumCategory", back_populates="topics")
    user = relationship("User")
    posts = relationship("ForumPost", back_populates="topic", cascade="all, delete-orphan")

    @property
    def category_name(self) -> str:
        return self.category.name if self.category else ""

    @property
    def category_icon(self) -> str:
        return self.category.icon if self.category else ""

    @property
    def author_name(self) -> str:
        return self.user.full_name or self.user.email if self.user else "Unknown"

    @property
    def author_avatar(self) -> str:
        return "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop"

    @property
    def status(self) -> str:
        if self.is_locked:
            return "Locked"
        for post in self.posts:
            if post.is_accepted_answer:
                return "Answered"
        return "Open"

    @property
    def reply_count(self) -> int:
        return len(self.posts)


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("forum_topics.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=True)
    is_accepted_answer = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    topic = relationship("ForumTopic", back_populates="posts")
    user = relationship("User")
    replies = relationship("ForumPost", backref="parent", remote_side=[id])

    @property
    def author_name(self) -> str:
        return self.user.full_name or self.user.email if self.user else "Unknown"

    @property
    def author_avatar(self) -> str:
        return "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop"

    @property
    def author_role(self) -> str:
        if self.user and self.user.role:
            return self.user.role.value
        return "user"


class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("forum_categories.id"), nullable=True, index=True)
    question = Column(String, unique=True, index=True, nullable=False)
    answer = Column(Text, nullable=False)
    order_num = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    helpful_count = Column(Integer, default=0, nullable=False, server_default="0")
    not_helpful_count = Column(Integer, default=0, nullable=False, server_default="0")

    # 384 dimensions for all-MiniLM-L6-v2 Semantic Search
    embedding = Column(Vector(384), nullable=True)

    category = relationship("ForumCategory")




class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(SupportTicketStatus), default=SupportTicketStatus.OPEN, nullable=False)
    priority = Column(Enum(SupportTicketPriority), default=SupportTicketPriority.MEDIUM, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")


class AiQueryLog(Base):
    __tablename__ = "ai_query_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    query_text = Column(Text, nullable=False)
    results_returned = Column(Integer, default=0)
    top_result_score = Column(Float, nullable=True)
    escalated_to_forum = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
