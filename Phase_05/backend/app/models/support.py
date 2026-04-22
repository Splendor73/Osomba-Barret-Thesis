import enum

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import foreign, relationship
from sqlalchemy.sql import func

from app.core.config import settings
from app.db.database import Base


SUPPORT_SCHEMA = settings.SUPPORT_DB_SCHEMA


class SupportUserRole(str, enum.Enum):
    AGENT = "agent"
    ADMIN = "admin"


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


class SupportUserRoleAssignment(Base):
    __tablename__ = "user_roles"
    __table_args__ = {"schema": SUPPORT_SCHEMA}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    assigned_by_user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True, index=True)
    role = Column(Enum(SupportUserRole), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship(
        "User",
        primaryjoin="foreign(SupportUserRoleAssignment.user_id) == User.user_id",
        foreign_keys=[user_id],
        back_populates="support_role_assignments",
    )
    assigned_by = relationship(
        "User",
        primaryjoin="foreign(SupportUserRoleAssignment.assigned_by_user_id) == User.user_id",
        foreign_keys=[assigned_by_user_id],
    )


class ForumCategory(Base):
    __tablename__ = "forum_categories"
    __table_args__ = {"schema": SUPPORT_SCHEMA}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    topics = relationship("ForumTopic", back_populates="category", cascade="all, delete-orphan")


class ForumTopic(Base):
    __tablename__ = "forum_topics"
    __table_args__ = {"schema": SUPPORT_SCHEMA}

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey(f"{SUPPORT_SCHEMA}.forum_categories.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    view_count = Column(Integer, default=0, nullable=False)
    embedding = Column(Vector(384), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("ForumCategory", back_populates="topics")
    user = relationship(
        "User",
        primaryjoin="foreign(ForumTopic.user_id) == User.user_id",
        foreign_keys=[user_id],
    )
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
    __table_args__ = {"schema": SUPPORT_SCHEMA}

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey(f"{SUPPORT_SCHEMA}.forum_topics.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey(f"{SUPPORT_SCHEMA}.forum_posts.id"), nullable=True)
    is_accepted_answer = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    topic = relationship("ForumTopic", back_populates="posts")
    user = relationship(
        "User",
        primaryjoin="foreign(ForumPost.user_id) == User.user_id",
        foreign_keys=[user_id],
    )
    replies = relationship("ForumPost", backref="parent", remote_side=[id])

    @property
    def author_name(self) -> str:
        return self.user.full_name or self.user.email if self.user else "Unknown"

    @property
    def author_avatar(self) -> str:
        return "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop"

    @property
    def author_role(self) -> str:
        if self.user:
            support_role = self.user.active_support_role
            if support_role:
                return support_role
        return "customer"


class FAQ(Base):
    __tablename__ = "faqs"
    __table_args__ = {"schema": SUPPORT_SCHEMA}

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey(f"{SUPPORT_SCHEMA}.forum_categories.id"), nullable=True, index=True)
    source_post_id = Column(Integer, ForeignKey(f"{SUPPORT_SCHEMA}.forum_posts.id"), nullable=True, index=True)
    question = Column(String, unique=True, index=True, nullable=False)
    answer = Column(Text, nullable=False)
    order_num = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    helpful_count = Column(Integer, default=0, nullable=False, server_default="0")
    not_helpful_count = Column(Integer, default=0, nullable=False, server_default="0")
    embedding = Column(Vector(384), nullable=True)

    category = relationship("ForumCategory")
    source_post = relationship("ForumPost")


class AiQueryLog(Base):
    __tablename__ = "ai_query_logs"
    __table_args__ = {"schema": SUPPORT_SCHEMA}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    query_text = Column(Text, nullable=False)
    results_returned = Column(Integer, default=0)
    top_result_score = Column(Float, nullable=True)
    escalated_to_forum = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship(
        "User",
        primaryjoin="foreign(AiQueryLog.user_id) == User.user_id",
        foreign_keys=[user_id],
    )


class ReportedContentStatus(str, enum.Enum):
    PENDING = "PENDING"
    REVIEWED = "REVIEWED"
    DISMISSED = "DISMISSED"
    DELETED = "DELETED"

class ReportedContent(Base):
    __tablename__ = "reported_content"
    __table_args__ = {"schema": SUPPORT_SCHEMA}

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey(f"{SUPPORT_SCHEMA}.forum_topics.id"), nullable=True, index=True)
    post_id = Column(Integer, ForeignKey(f"{SUPPORT_SCHEMA}.forum_posts.id"), nullable=True, index=True)
    reason = Column(String, nullable=False)
    status = Column(Enum(ReportedContentStatus), default=ReportedContentStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reporter = relationship(
        "User",
        primaryjoin="foreign(ReportedContent.reporter_id) == User.user_id",
        foreign_keys=[reporter_id],
    )
    topic = relationship("ForumTopic", foreign_keys=[topic_id])
    post = relationship("ForumPost", foreign_keys=[post_id])

