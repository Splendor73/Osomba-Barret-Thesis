from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    user_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[UserRole] = UserRole.BUYER
    is_onboarded: bool = False


class UserJitCreate(BaseModel):
    terms_version: str
    marketing_opt_in: bool


class UserOnboard(BaseModel):
    full_name: str
    user_name: str
    phone_number: Optional[str] = None
    address: str
    city: str
    country: str
    bio: Optional[str] = None
    role: UserRole = UserRole.BUYER


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    user_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    marketing_opt_in: Optional[bool] = None
    role: Optional[UserRole] = None


class UserResponse(UserBase):
    user_id: int
    created_at: datetime
    accepted_terms_at: datetime
    terms_version: str
    marketing_opt_in: bool

    model_config = ConfigDict(from_attributes=True)
