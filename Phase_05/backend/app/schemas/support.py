from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from datetime import datetime
from app.models.support import SupportTicketStatus, SupportTicketPriority

_ICON_EMOJI_MAP = {
    "paid": "💳",
    "inventory": "🏷️",
    "health_and_safety": "🛡️",
    "gavel": "⚖️",
    "account_circle": "👤",
    "local_shipping": "🚚",
    "info": "ℹ️",
}

# --- API Shared Schemas ---
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    size: int
    pages: int

# --- Forum Categories ---
class ForumCategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True

class ForumCategoryCreate(ForumCategoryBase):
    pass

class ForumCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None

class ForumCategoryResponse(ForumCategoryBase):
    id: int
    icon_url: Optional[str] = None

    @model_validator(mode="after")
    def set_icon_url(self) -> "ForumCategoryResponse":
        icon_val = self.icon or ""
        self.icon_url = _ICON_EMOJI_MAP.get(icon_val, icon_val or "📝")
        return self

    class Config:
        from_attributes = True


# --- Forum Topics ---
class ForumTopicBase(BaseModel):
    title: str = Field(..., max_length=200)
    content: str
    category_id: int

class ForumTopicCreate(ForumTopicBase):
    pass

class ForumTopicUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    category_id: Optional[int] = None
    is_pinned: Optional[bool] = None
    is_locked: Optional[bool] = None

class ForumTopicResponse(ForumTopicBase):
    id: int
    user_id: int
    is_pinned: bool
    is_locked: bool
    view_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class UIForumTopicResponse(ForumTopicResponse):
    category_name: str = ""
    category_icon: Optional[str] = None
    author_name: str = ""
    author_avatar: str = ""
    status: str = "Open"
    reply_count: int = 0


# --- Forum Posts ---
class ForumPostBase(BaseModel):
    content: str
    topic_id: Optional[int] = None
    parent_id: Optional[int] = None

class ForumPostCreate(ForumPostBase):
    pass

class ForumPostUpdate(BaseModel):
    content: str
    is_accepted_answer: Optional[bool] = None

class ForumPostResponse(ForumPostBase):
    id: int
    user_id: int
    is_accepted_answer: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UIForumPostResponse(ForumPostResponse):
    author_name: str = ""
    author_avatar: str = ""
    author_role: str = "user"

class OfficialAnswerRequest(BaseModel):
    content: Optional[str] = None
    post_id: Optional[int] = None

class TopicLockRequest(BaseModel):
    is_locked: bool

class ConvertToFAQRequest(BaseModel):
    post_id: int
    question: str
    category_id: Optional[int] = None


class ReportRequest(BaseModel):
    topic_id: Optional[int] = None
    post_id: Optional[int] = None
    reason: str

# --- FAQs ---
class FAQBase(BaseModel):
    question: str = Field(..., max_length=255)
    answer: str
    order_num: int = 0
    is_active: bool = True

class FAQCreate(FAQBase):
    category_id: Optional[int] = None
    source_post_id: Optional[int] = None

class FAQUpdate(BaseModel):
    question: Optional[str] = Field(None, max_length=255)
    answer: Optional[str] = None
    order_num: Optional[int] = None
    is_active: Optional[bool] = None

class FAQVote(BaseModel):
    is_helpful: bool

class FAQResponse(FAQBase):
    id: int
    helpful_count: int = 0
    not_helpful_count: int = 0
    source_post_id: Optional[int] = None
    category_name: Optional[str] = None
    category_icon: Optional[str] = None

    class Config:
        from_attributes = True





# --- Support Tickets ---
class SupportTicketBase(BaseModel):
    subject: str = Field(..., max_length=150)
    description: str
    priority: SupportTicketPriority = SupportTicketPriority.MEDIUM

class SupportTicketCreate(SupportTicketBase):
    pass

class SupportTicketUpdate(BaseModel):
    subject: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    status: Optional[SupportTicketStatus] = None
    priority: Optional[SupportTicketPriority] = None

class SupportTicketResponse(SupportTicketBase):
    id: int
    user_id: int
    status: SupportTicketStatus
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
