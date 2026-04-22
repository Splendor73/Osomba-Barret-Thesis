from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.exceptions import PermissionDeniedException
from app.core.config import settings
from app.models.support import SupportUserRole, SupportUserRoleAssignment
from app.models.user import User


def normalize_groups(payload: dict | None) -> set[str]:
    if not payload:
        return set()
    return {str(group).lower() for group in payload.get("cognito:groups", [])}


def get_support_role(db: Session, user_id: int) -> SupportUserRole | None:
    assignment = (
        db.query(SupportUserRoleAssignment)
        .filter(
            SupportUserRoleAssignment.user_id == user_id,
            SupportUserRoleAssignment.is_active.is_(True),
        )
        .first()
    )
    return assignment.role if assignment else None


def get_effective_support_role(db: Session, user: User, payload: dict | None = None) -> str | None:
    groups = normalize_groups(payload)
    admin_group = settings.cognito_admin_group_name.lower()
    agent_group = settings.cognito_agent_group_name.lower()

    if admin_group in groups or "admin" in groups:
        return SupportUserRole.ADMIN.value
    if agent_group in groups or "agent" in groups:
        return SupportUserRole.AGENT.value

    assignment = get_support_role(db, user.user_id)
    if assignment:
        return assignment.value

    fallback_role = user.active_support_role
    if fallback_role:
        return fallback_role

    return None


def set_support_role(
    db: Session,
    *,
    user_id: int,
    role: SupportUserRole,
    assigned_by_user_id: int | None,
) -> SupportUserRoleAssignment:
    assignment = (
        db.query(SupportUserRoleAssignment)
        .filter(SupportUserRoleAssignment.user_id == user_id)
        .first()
    )
    if assignment:
        assignment.role = role
        assignment.is_active = True
        assignment.assigned_by_user_id = assigned_by_user_id
    else:
        assignment = SupportUserRoleAssignment(
            user_id=user_id,
            role=role,
            is_active=True,
            assigned_by_user_id=assigned_by_user_id,
        )
        db.add(assignment)

    db.commit()
    db.refresh(assignment)
    return assignment


def ensure_support_write_access(user: User) -> None:
    if user.is_banned:
        raise PermissionDeniedException(
            "Your support access has been blocked. Please use Contact Us at support@osomba.com or +1 800 500 0011 for more information."
        )
