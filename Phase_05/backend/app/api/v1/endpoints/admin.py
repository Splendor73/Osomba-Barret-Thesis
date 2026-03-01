from fastapi import APIRouter
from app.api.dependencies import SessionDep, AdminUserDep, AgentUserDep
from sqlalchemy import func
from app.models.support import ForumTopic, ForumPost, FAQ, AiQueryLog, ForumCategory
from app.models.user import User, UserRole
from app.models.order import Order, Payment, PaymentStatus
from pydantic import BaseModel

class UserRoleUpdateRequest(BaseModel):
    role: str

router = APIRouter()

@router.get("/system-health")
def admin_health_check(admin: AdminUserDep):
    return {
        "status": "online",
        "admin_verified": True,
        "thesis_mode": True
    }

@router.get("/analytics/overview")
def get_analytics_overview(db: SessionDep, admin: AdminUserDep):
    total_posts = db.query(func.count(ForumTopic.id)).scalar() or 0
    total_answered = db.query(func.count(func.distinct(ForumPost.topic_id))).filter(ForumPost.is_accepted_answer == True).scalar() or 0
    total_faqs = db.query(func.count(FAQ.id)).filter(FAQ.is_active == True).scalar() or 0
    total_ai_queries = db.query(func.count(AiQueryLog.id)).scalar() or 0
    
    escalated_queries = db.query(func.count(AiQueryLog.id)).filter(AiQueryLog.escalated_to_forum == True).scalar() or 0
    deflection_rate = 0.0
    if total_ai_queries > 0:
        deflection_rate = ((total_ai_queries - escalated_queries) / total_ai_queries) * 100.0
        
    return {
        "total_posts": total_posts,
        "total_answered": total_answered,
        "total_faqs": total_faqs,
        "total_ai_queries": total_ai_queries,
        "deflection_rate": round(deflection_rate, 1),
        "avg_response_time": "2h 45m"
    }

@router.get("/analytics/posts-over-time")
def get_posts_over_time(db: SessionDep, admin: AdminUserDep):
    from sqlalchemy.sql import cast
    from sqlalchemy import Date
    res = db.query(
        cast(ForumTopic.created_at, Date).label("date"),
        func.count(ForumTopic.id).label("count")
    ).group_by(cast(ForumTopic.created_at, Date)).order_by(cast(ForumTopic.created_at, Date)).all()
    
    return [{"date": str(r.date), "count": r.count} for r in res]

@router.get("/analytics/category-distribution")
def get_category_distribution(db: SessionDep, admin: AdminUserDep):
    res = db.query(
        ForumCategory.name.label("category"),
        func.count(ForumTopic.id).label("count")
    ).join(ForumTopic, ForumCategory.id == ForumTopic.category_id).group_by(ForumCategory.name).all()
    
    return [{"category": r.category, "count": r.count} for r in res]

@router.get("/analytics/top-queries")
def get_top_queries(db: SessionDep, admin: AdminUserDep):
    res = db.query(
        AiQueryLog.query_text.label("query"),
        func.count(AiQueryLog.id).label("count")
    ).group_by(AiQueryLog.query_text).order_by(func.count(AiQueryLog.id).desc()).limit(10).all()
    
    return [{"query": r.query, "count": r.count} for r in res]

@router.get("/users")
def get_admin_users(db: SessionDep, admin: AdminUserDep, search: str = ""):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    users = query.limit(50).all()
    # Provide a unified string role in response
    return [{"user_id": u.user_id, "email": u.email, "role": u.role.value if hasattr(u.role, 'value') else str(u.role) if u.role else None, "full_name": u.full_name} for u in users]

@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, request: UserRoleUpdateRequest, db: SessionDep, admin: AdminUserDep):
    from fastapi import HTTPException
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    try:
        new_role = UserRole(request.role.lower())
    except ValueError:
        # Fallback if invalid role
        raise HTTPException(status_code=400, detail=f"Invalid role: {request.role}")
        
    user.role = new_role
    db.commit()
    return {"status": "success", "new_role": user.role.value if hasattr(user.role, 'value') else str(user.role)}

@router.get("/users/{user_id}/support-context")
def get_user_support_context(user_id: int, db: SessionDep, agent: AgentUserDep):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
        
    total_orders = db.query(func.count(Order.order_id)).filter(Order.buyer_id == user_id).scalar() or 0
    orders = db.query(Order).filter(Order.buyer_id == user_id).order_by(Order.order_id.desc()).limit(5).all()
    
    order_ids = [o.order_id for o in orders]
    failed_payments = 0
    if order_ids:
        failed_payments = db.query(func.count(Payment.payment_id)).filter(
            Payment.order_id.in_(order_ids),
            Payment.payment_status == PaymentStatus.FAILED
        ).scalar() or 0
        
    past_forum_posts = db.query(func.count(ForumTopic.id)).filter(ForumTopic.user_id == user_id).scalar() or 0
    past_resolved_posts = db.query(func.count(ForumTopic.id)).filter(
        ForumTopic.user_id == user_id, 
        ForumTopic.status == "Answered"
    ).scalar() or 0
    
    recent_orders = []
    for o in orders:
        pmt = db.query(Payment).filter(Payment.order_id == o.order_id).order_by(Payment.payment_id.desc()).first()
        recent_orders.append({
            "order_id": o.order_id,
            "total_cost": float(o.total_cost),
            "shipping_status": o.shipping_status,
            "payment_status": pmt.payment_status.value if pmt and hasattr(pmt, 'payment_status') else "UNKNOWN",
            "items_count": len(o.items) if hasattr(o, 'items') else 0
        })

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
        "past_resolved_posts": past_resolved_posts
    }
