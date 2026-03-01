from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class UserRole(str, enum.Enum):
    BUYER = "BUYER"
    SELLER = "SELLER"
    BOTH = "BOTH"
    admin = "admin"
    agent = "agent"


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)  # Renamed from id to match schema
    user_name = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    cognito_sub = Column(String, unique=True, index=True, nullable=True)
    is_onboarded = Column(Boolean, default=False, nullable=False)
    full_name = Column(String)
    address = Column(String)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    twofa_enabled = Column(Boolean, default=False)
    twofa_secret_key = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=True)
    accepted_terms_at = Column(DateTime(timezone=True), nullable=False)
    terms_version = Column(String, nullable=False)
    marketing_opt_in = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

