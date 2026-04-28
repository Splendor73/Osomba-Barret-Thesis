import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

class UserRole(str, enum.Enum):
    BUYER = "BUYER"
    SELLER = "SELLER"
    BUSINESS_SELLER = "BUSINESS_SELLER"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)  # Renamed from id to match schema
    user_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=False)
    cognito_sub = Column(String, nullable=True)
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
    is_verified = Column(Boolean, default=False, nullable=False)
    is_banned = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    support_role_assignments = relationship(
        "SupportUserRoleAssignment",
        primaryjoin="User.user_id == foreign(SupportUserRoleAssignment.user_id)",
        foreign_keys="SupportUserRoleAssignment.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    @property
    def active_support_role(self) -> str | None:
        for assignment in self.support_role_assignments:
            if assignment.is_active:
                return assignment.role.value
        if self.role == UserRole.admin or self.role == "admin":
            return "admin"
        return None
