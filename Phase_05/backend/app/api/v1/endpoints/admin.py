from datetime import datetime, timezone

import boto3
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import case, func

from app.api.dependencies import AdminUserDep, AgentUserDep, SessionDep
from app.core.config import settings
from app.models.order import Order, Payment, PaymentStatus
from app.models.support import (
    AiQueryLog,
    FAQ,
    ForumCategory,
    ForumPost,
    ForumTopic,
    ReportedContent,
    ReportedContentStatus,
    SupportUserRole,
)
from app.models.user import User
from app.services.email_service import send_notification_email
from app.services.support_access_service import get_effective_support_role, set_support_role


class UserRoleUpdateRequest(BaseModel):
    role: str


router = APIRouter()


def _serialize_support_user(db, user: User) -> dict:
    return {
        "user_id": user.user_id,
        "email": user.email,
        "role": get_effective_support_role(db, user),
        "full_name": user.full_name,
    }


def _sync_cognito_support_group(user: User, new_role: SupportUserRole) -> None:
    if not user.email or not settings.cognito_user_pool_id:
        return

    cognito = boto3.client("cognito-idp", region_name=settings.aws_region)
    username = user.email
    admin_group = settings.cognito_admin_group_name
    agent_group = settings.cognito_agent_group_name

    try:
        for group in [admin_group, agent_group]:
            try:
                cognito.admin_remove_user_from_group(
                    UserPoolId=settings.cognito_user_pool_id,
                    Username=username,
                    GroupName=group,
                )
            except cognito.exceptions.ResourceNotFoundException:
                pass

        target_group = admin_group if new_role == SupportUserRole.ADMIN else agent_group
        cognito.admin_add_user_to_group(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username,
            GroupName=target_group,
        )
    except Exception as exc:
        print(f"[Cognito] Failed to sync support role for {user.email}: {exc}")


@router.get("/system-health")
def admin_health_check(admin: AdminUserDep):
    return {
        "status": "online",
        "admin_verified": True,
        "support_mode": True,
    }


@router.get("/analytics/overview")
def get_analytics_overview(db: SessionDep, admin: AdminUserDep):
    total_posts = db.query(func.count(ForumTopic.id)).scalar() or 0
    total_answered = (
        db.query(func.count(func.distinct(ForumPost.topic_id)))
        .filter(ForumPost.is_accepted_answer.is_(True))
        .scalar()
        or 0
    )
    total_faqs = db.query(func.count(FAQ.id)).filter(FAQ.is_active.is_(True)).scalar() or 0
    total_ai_queries = db.query(func.count(AiQueryLog.id)).scalar() or 0

    escalated_queries = (
        db.query(func.count(AiQueryLog.id))
        .filter(AiQueryLog.escalated_to_forum.is_(True))
        .scalar()
        or 0
    )
    deflection_rate = 0.0
    if total_ai_queries > 0:
        deflection_rate = ((total_ai_queries - escalated_queries) / total_ai_queries) * 100.0

    answered_topics = (
        db.query(ForumTopic.created_at, func.min(ForumPost.created_at).label("first_answer"))
        .join(ForumPost, ForumTopic.id == ForumPost.topic_id)
        .filter(ForumPost.is_accepted_answer.is_(True))
        .group_by(ForumTopic.id, ForumTopic.created_at)
        .all()
    )
    if answered_topics:
        total_hours = sum(
            (row.first_answer - row.created_at).total_seconds() / 3600
            for row in answered_topics
            if row.first_answer and row.created_at
        )
        avg_hours = total_hours / len(answered_topics)
        avg_response_time = f"{int(avg_hours)}h {int((avg_hours - int(avg_hours)) * 60)}m"
    else:
        avg_response_time = "N/A"

    return {
        "total_posts": total_posts,
        "total_answered": total_answered,
        "total_faqs": total_faqs,
        "total_ai_queries": total_ai_queries,
        "deflection_rate": round(deflection_rate, 1),
        "avg_response_time": avg_response_time,
    }


@router.get("/analytics/posts-over-time")
def get_posts_over_time(db: SessionDep, admin: AdminUserDep):
    from sqlalchemy import Date
    from sqlalchemy.sql import cast

    rows = (
        db.query(cast(ForumTopic.created_at, Date).label("date"), func.count(ForumTopic.id).label("count"))
        .group_by(cast(ForumTopic.created_at, Date))
        .order_by(cast(ForumTopic.created_at, Date))
        .all()
    )
    return [{"date": str(row.date), "count": row.count} for row in rows]


@router.get("/analytics/category-distribution")
def get_category_distribution(db: SessionDep, admin: AdminUserDep):
    rows = (
        db.query(ForumCategory.name.label("category"), func.count(ForumTopic.id).label("count"))
        .join(ForumTopic, ForumCategory.id == ForumTopic.category_id)
        .group_by(ForumCategory.name)
        .all()
    )
    return [{"category": row.category, "count": row.count} for row in rows]


@router.get("/analytics/top-queries")
def get_top_queries(db: SessionDep, admin: AdminUserDep):
    rows = (
        db.query(AiQueryLog.query_text.label("query"), func.count(AiQueryLog.id).label("count"))
        .group_by(AiQueryLog.query_text)
        .order_by(func.count(AiQueryLog.id).desc())
        .limit(10)
        .all()
    )
    return [{"query": row.query, "count": row.count} for row in rows]


@router.get("/users")
def get_admin_users(db: SessionDep, admin: AdminUserDep, search: str = ""):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%"))
        )
    users = query.order_by(User.created_at.desc()).limit(50).all()
    return [_serialize_support_user(db, user) for user in users]


@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, request: UserRoleUpdateRequest, db: SessionDep, admin: AdminUserDep):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    normalized_role = request.role.strip().lower()
    if normalized_role not in {SupportUserRole.ADMIN.value, SupportUserRole.AGENT.value}:
        raise HTTPException(status_code=400, detail=f"Invalid support role: {request.role}")

    support_role = SupportUserRole(normalized_role)
    assignment = set_support_role(
        db,
        user_id=user.user_id,
        role=support_role,
        assigned_by_user_id=admin.user_id,
    )
    _sync_cognito_support_group(user, support_role)
    return {"status": "success", "new_role": assignment.role.value}


@router.get("/users/{user_id}/support-context")
def get_user_support_context(user_id: int, db: SessionDep, agent: AgentUserDep):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_orders = db.query(func.count(Order.order_id)).filter(Order.buyer_id == user_id).scalar() or 0
    orders = (
        db.query(Order)
        .filter(Order.buyer_id == user_id)
        .order_by(Order.order_id.desc())
        .limit(5)
        .all()
    )

    order_ids = [order.order_id for order in orders]
    failed_payments = 0
    if order_ids:
        failed_payments = (
            db.query(func.count(Payment.payment_id))
            .filter(
                Payment.order_id.in_(order_ids),
                Payment.payment_status == PaymentStatus.FAILED,
            )
            .scalar()
            or 0
        )

    past_forum_posts = db.query(func.count(ForumTopic.id)).filter(ForumTopic.user_id == user_id).scalar() or 0
    past_resolved_posts = (
        db.query(func.count(func.distinct(ForumPost.topic_id)))
        .join(ForumTopic, ForumPost.topic_id == ForumTopic.id)
        .filter(
            ForumTopic.user_id == user_id,
            ForumPost.is_accepted_answer.is_(True),
        )
        .scalar()
        or 0
    )

    recent_orders = []
    for order in orders:
        payment = (
            db.query(Payment)
            .filter(Payment.order_id == order.order_id)
            .order_by(
                case((Payment.payment_status == PaymentStatus.FAILED, 0), else_=1),
                Payment.payment_id.desc(),
            )
            .first()
        )
        recent_orders.append(
            {
                "order_id": order.order_id,
                "total_cost": float(order.total_cost),
                "shipping_status": order.shipping_status,
                "payment_status": payment.payment_status.value if payment and hasattr(payment, "payment_status") else "UNKNOWN",
                "items_count": len(order.items) if hasattr(order, "items") else 0,
            }
        )

    return {
        "user_id": user.user_id,
        "full_name": user.full_name or "Unknown User",
        "email": user.email,
        "country": user.country or "Unknown",
        "member_since": str(user.created_at.date()) if user.created_at else "Unknown",
        "total_orders": total_orders,
        "failed_payments": failed_payments,
        "recent_orders": recent_orders,
        "past_forum_posts": past_forum_posts,
        "past_resolved_posts": past_resolved_posts,
    }


@router.get("/users/investigate")
def investigate_support_users(db: SessionDep, agent: AgentUserDep, query: str = ""):
    normalized_query = query.strip()

    if normalized_query:
        users = (
            db.query(User)
            .filter(
                (User.email.ilike(f"%{normalized_query}%")) |
                (User.full_name.ilike(f"%{normalized_query}%")) |
                (User.user_name.ilike(f"%{normalized_query}%"))
            )
            .order_by(User.is_banned.desc(), User.created_at.desc())
            .limit(20)
            .all()
        )
    else:
        users = (
            db.query(User)
            .filter(User.is_banned.is_(True))
            .order_by(User.created_at.desc())
            .limit(20)
            .all()
        )

    return [
        {
            "user_id": user.user_id,
            "email": user.email,
            "full_name": user.full_name,
            "user_name": user.user_name,
            "is_blocked": user.is_banned,
            "support_role": get_effective_support_role(db, user) or "customer",
        }
        for user in users
    ]


@router.get("/users/{user_id}/support-activity")
def get_user_support_activity(user_id: int, db: SessionDep, agent: AgentUserDep):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    topics = (
        db.query(ForumTopic)
        .filter(ForumTopic.user_id == user_id)
        .order_by(ForumTopic.created_at.desc())
        .all()
    )
    posts = (
        db.query(ForumPost)
        .filter(ForumPost.user_id == user_id)
        .order_by(ForumPost.created_at.desc())
        .all()
    )

    return {
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "full_name": user.full_name,
            "user_name": user.user_name,
            "is_blocked": user.is_banned,
            "support_role": get_effective_support_role(db, user) or "customer",
        },
        "topics": [
            {
                "id": topic.id,
                "title": topic.title,
                "content": topic.content,
                "is_deleted": topic.is_deleted,
                "created_at": str(topic.created_at),
            }
            for topic in topics
        ],
        "posts": [
            {
                "id": post.id,
                "topic_id": post.topic_id,
                "content": post.content,
                "is_deleted": post.is_deleted,
                "is_accepted_answer": post.is_accepted_answer,
                "created_at": str(post.created_at),
            }
            for post in posts
        ],
    }


@router.get("/reports")
def get_reports(db: SessionDep, agent: AgentUserDep):
    reports = db.query(ReportedContent).order_by(ReportedContent.created_at.desc()).all()
    results = []
    for r in reports:
        resolved_topic_id = r.topic_id
        target_content = ""
        content_type = None
        content_author_id = None
        content_author_email = None
        content_author_blocked = False
        content_deleted = False
        if r.post_id and r.post:
            content_type = "post"
            target_content = r.post.content
            resolved_topic_id = r.post.topic_id
            content_author_id = r.post.user_id
            content_author_email = r.post.user.email if r.post.user else None
            content_author_blocked = bool(r.post.user.is_banned) if r.post.user else False
            content_deleted = r.post.is_deleted
        elif r.topic_id and r.topic:
            content_type = "topic"
            target_content = r.topic.title + " - " + r.topic.content
            content_author_id = r.topic.user_id
            content_author_email = r.topic.user.email if r.topic.user else None
            content_author_blocked = bool(r.topic.user.is_banned) if r.topic.user else False
            content_deleted = r.topic.is_deleted
        elif r.post_id:
            content_type = "post"
            content_deleted = True
        elif r.topic_id:
            content_type = "topic"
            content_deleted = True

        results.append({
            "id": r.id,
            "reporter_email": r.reporter.email if r.reporter else "Unknown",
            "topic_id": resolved_topic_id,
            "post_id": r.post_id,
            "content_type": content_type,
            "content_author_id": content_author_id,
            "content_author_email": content_author_email,
            "content_author_blocked": content_author_blocked,
            "content_deleted": content_deleted,
            "reason": r.reason,
            "status": r.status.value,
            "target_content": target_content[:200] + "..." if len(target_content) > 200 else target_content,
            "created_at": str(r.created_at)
        })
    return results

@router.post("/reports/{report_id}/dismiss")
def dismiss_report(report_id: int, db: SessionDep, agent: AgentUserDep):
    report = db.query(ReportedContent).filter(ReportedContent.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = ReportedContentStatus.DISMISSED
    db.commit()
    return {"status": "success"}

@router.post("/reports/{report_id}/delete-content")
def delete_reported_content(report_id: int, db: SessionDep, agent: AgentUserDep):
    report = db.query(ReportedContent).filter(ReportedContent.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.post_id and report.post:
        report.post.is_deleted = True
        report.post.deleted_at = datetime.now(timezone.utc)
    elif report.topic_id and report.topic:
        report.topic.is_deleted = True
        report.topic.deleted_at = datetime.now(timezone.utc)
        
    report.status = ReportedContentStatus.DELETED
    db.commit()
    return {"status": "success"}

@router.post("/users/{user_id}/block")
def block_user(user_id: int, db: SessionDep, agent: AgentUserDep):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_banned = True
    db.commit()
    
    try:
        subject = "Osomba Support Access Update"
        html_content = f"""
        <div style='font-family: Arial, sans-serif; padding: 20px;'>
            <h2 style='color: #d32f2f;'>Account Notice</h2>
            <p>Hello,</p>
            <p>Your access to Osomba Support has been blocked.</p>
            <p>Please use Contact Us for more information:</p>
            <ul>
                <li>Email: support@osomba.com</li>
                <li>Phone: +1 800 500 0011</li>
            </ul>
        </div>
        """
        if user.email:
            send_notification_email(user.email, subject, html_content)
    except Exception as e:
        print(f"Failed to send block email: {e}")
        
    return {"status": "success"}


@router.post("/users/{user_id}/unblock")
def unblock_user(user_id: int, db: SessionDep, agent: AgentUserDep):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_banned = False
    db.commit()

    try:
        subject = "Osomba Support Access Restored"
        html_content = """
        <div style='font-family: Arial, sans-serif; padding: 20px;'>
            <h2 style='color: #F67C01;'>Support Access Restored</h2>
            <p>Hello,</p>
            <p>Your access to Osomba Support has been restored. You can post and reply in the support forum again.</p>
            <p>If you have any questions, please contact us:</p>
            <ul>
                <li>Email: support@osomba.com</li>
                <li>Phone: +1 800 500 0011</li>
            </ul>
        </div>
        """
        if user.email:
            send_notification_email(user.email, subject, html_content)
    except Exception as e:
        print(f"Failed to send unblock email: {e}")

    return {"status": "success"}
