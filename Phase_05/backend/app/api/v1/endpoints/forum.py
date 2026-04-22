from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.api.dependencies import SessionDep, CurrentUserDep, AdminUserDep, AgentUserDep
from app.core.config import settings
from app.schemas.support import ForumTopicCreate, ForumTopicResponse, UIForumTopicResponse, ForumPostCreate, ForumPostResponse, UIForumPostResponse, OfficialAnswerRequest, TopicLockRequest, ForumTopicUpdate, ForumPostUpdate, ConvertToFAQRequest, FAQCreate, FAQResponse, ReportRequest
from app.services import forum_service
from app.crud import faq as faq_crud
from app.services.ai_service import generate_embedding, translate_text
from app.services.email_service import send_notification_email
from app.services.support_access_service import ensure_support_write_access
from app.models.user import User

router = APIRouter()

@router.get("/topics", response_model=List[UIForumTopicResponse])
def get_topics(db: SessionDep, skip: int = 0, limit: int = 10, lang: Optional[str] = Query(None)):
    """Returns a list of topics. AI translates titles only for the current batch."""
    topics = forum_service.get_topics(db, skip, limit)
    
    if lang and lang.lower() != 'en':
        for t in topics:
            t.title = translate_text(t.title, lang)
            
    return topics

@router.get("/topics/{topic_id}", response_model=UIForumTopicResponse)
def get_topic(topic_id: int, db: SessionDep, lang: Optional[str] = Query(None)):
    """Returns a single topic with FULL AI translation (Title + Content)."""
    topic = forum_service.get_topic(db, topic_id)
    if not topic:
         raise HTTPException(status_code=404, detail="Topic not found")

    if lang and lang.lower() != 'en':
        topic.title = translate_text(topic.title, lang)
        topic.content = translate_text(topic.content, lang)
        
    return topic

@router.post("/topics", response_model=UIForumTopicResponse)
def create_topic(topic: ForumTopicCreate, db: SessionDep, current_user: CurrentUserDep):
    ensure_support_write_access(current_user)
    return forum_service.create_topic(db, topic, current_user.user_id)

@router.get("/topics/{topic_id}/posts", response_model=List[UIForumPostResponse])
def get_posts(topic_id: int, db: SessionDep, skip: int = 0, limit: int = 100, lang: Optional[str] = Query(None)):
    """Returns replies for a topic. AI translates content of all replies in this thread."""
    topic = forum_service.get_topic(db, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    posts = forum_service.get_posts_by_topic(db, topic_id, skip, limit)
    
    if lang and lang.lower() != 'en':
        for p in posts:
            p.content = translate_text(p.content, lang)
            
    return posts

@router.post("/topics/{topic_id}/posts", response_model=UIForumPostResponse)
def create_post(topic_id: int, post: ForumPostCreate, db: SessionDep, current_user: CurrentUserDep):
    ensure_support_write_access(current_user)
    topic = forum_service.get_topic(db, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    if topic.is_locked:
        raise HTTPException(status_code=423, detail="Topic is locked")

    post.topic_id = topic_id
    return forum_service.create_post(db, post, current_user.user_id)

@router.post("/topics/{topic_id}/official-answer", response_model=ForumPostResponse)
def official_answer(topic_id: int, req: OfficialAnswerRequest, db: SessionDep, agent: AgentUserDep):
    topic = forum_service.get_topic(db, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    post_id_to_mark = req.post_id
    
    if req.content:
        # Create a new post representing the official answer
        new_post_data = ForumPostCreate(content=req.content, topic_id=topic_id)
        created = forum_service.create_post(db, new_post_data, agent.user_id)
        post_id_to_mark = created.id
        
    if not post_id_to_mark:
        raise HTTPException(status_code=400, detail="Must provide either content or post_id")
        
    # Mark it as accepted
    existing = forum_service.forum_crud.get_post(db, post_id_to_mark)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
        
    update_data = ForumPostUpdate(content=existing.content, is_accepted_answer=True)
    updated_post = forum_service.update_post(db, post_id_to_mark, update_data)

    # Notify topic author (best-effort, never crash the endpoint)
    try:
        topic_author = db.query(User).filter(User.user_id == topic.user_id).first()
        if topic_author and topic_author.email:
            subject = f"Official Answer: {topic.title}"
            thread_url = f"{settings.SUPPORT_FRONTEND_URL.rstrip('/')}/thread/{topic.id}"
            html_content = f"""
            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                <h2 style='color: #F67C01;'>Osomba Help</h2>
                <p>Hello <b>{topic_author.full_name or topic_author.email}</b>,</p>
                <p>An official support agent has provided an answer to your question:</p>
                <div style='background: #f9f9f9; padding: 15px; border-left: 4px solid #46BB39; margin: 20px 0;'>
                    <h3 style='margin-top: 0;'>{topic.title}</h3>
                    <p><i>{updated_post.content[:200]}...</i></p>
                </div>
                <p>You can view the full answer here: <a href='{thread_url}' style='color: #F67C01; font-weight: bold;'>View Thread</a></p>
                <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;' />
                <p style='font-size: 12px; color: #888;'>This is an automated notification from Osomba Marketplace. Please do not reply to this email.</p>
            </div>
            """
            send_notification_email(topic_author.email, subject, html_content)
    except Exception as e:
        print(f"[Email] Failed to notify topic author: {e}")

    return updated_post

@router.post("/topics/{topic_id}/lock", response_model=UIForumTopicResponse)
def lock_topic(topic_id: int, req: TopicLockRequest, db: SessionDep, agent: AgentUserDep):
    update_data = ForumTopicUpdate(is_locked=req.is_locked)
    updated = forum_service.update_topic(db, topic_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Topic not found")
    return updated

@router.post("/topics/{topic_id}/convert-to-faq", response_model=FAQResponse)
def convert_to_faq(topic_id: int, req: ConvertToFAQRequest, db: SessionDep, admin: AdminUserDep):
    topic = forum_service.get_topic(db, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    post = forum_service.forum_crud.get_post(db, req.post_id)
    if not post or post.topic_id != topic_id:
        raise HTTPException(status_code=404, detail="Post not found in this topic")

    # Check if this post was already converted (by source_post_id or duplicate question)
    from app.models.support import FAQ
    existing_by_post = db.query(FAQ).filter(FAQ.source_post_id == req.post_id).first()
    if existing_by_post:
        raise HTTPException(status_code=409, detail="This post has already been converted to a FAQ")

    existing_by_question = db.query(FAQ).filter(FAQ.question == req.question).first()
    if existing_by_question:
        raise HTTPException(status_code=409, detail="A FAQ with this question already exists")

    faq_data = FAQCreate(
        question=req.question,
        answer=post.content,
        category_id=req.category_id or topic.category_id,
        source_post_id=req.post_id,
        is_active=True,
        order_num=0
    )
    embedding = generate_embedding(req.question + " " + post.content)
    created = faq_crud.create_faq(db, faq_data, embedding)
    return created

@router.get("/topics/{topic_id}/faq-status/{post_id}")
def faq_status(topic_id: int, post_id: int, db: SessionDep, admin: AdminUserDep):
    from app.models.support import FAQ
    # Check by source_post_id first, then fall back to matching question title
    faq = db.query(FAQ).filter(FAQ.source_post_id == post_id).first()
    if not faq:
        topic = forum_service.get_topic(db, topic_id)
        if topic:
            faq = db.query(FAQ).filter(FAQ.question == topic.title).first()
    return {"is_faq": faq is not None, "faq_id": faq.id if faq else None}

@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, db: SessionDep, agent: AgentUserDep):
    topic = forum_service.get_topic(db, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    forum_service.forum_crud.delete_topic(db, topic_id)
    return {"detail": "Topic deleted successfully"}

@router.delete("/topics/{topic_id}/posts/{post_id}")
def delete_post(topic_id: int, post_id: int, db: SessionDep, agent: AgentUserDep):
    post = forum_service.forum_crud.get_post(db, post_id)
    if not post or post.topic_id != topic_id:
        raise HTTPException(status_code=404, detail="Post not found")
        
    forum_service.forum_crud.delete_post(db, post_id)
    return {"detail": "Post deleted successfully"}

@router.delete("/topics/{topic_id}/undo-faq/{post_id}")
def undo_faq(topic_id: int, post_id: int, db: SessionDep, admin: AdminUserDep):
    from app.models.support import FAQ
    # Check by source_post_id first, then fall back to matching question title
    faq = db.query(FAQ).filter(FAQ.source_post_id == post_id).first()
    if not faq:
        topic = forum_service.get_topic(db, topic_id)
        if topic:
            faq = db.query(FAQ).filter(FAQ.question == topic.title).first()
    if not faq:
        raise HTTPException(status_code=404, detail="No FAQ found for this post")
    faq_crud.delete_faq(db, faq.id)
    return {"detail": "FAQ reverted successfully"}

@router.post("/reports")
def create_report(req: ReportRequest, db: SessionDep, current_user: CurrentUserDep):
    ensure_support_write_access(current_user)
    if not req.topic_id and not req.post_id:
        raise HTTPException(status_code=400, detail="Must provide topic_id or post_id")
    from app.models.support import ReportedContent

    if req.post_id:
        post = forum_service.forum_crud.get_post(db, req.post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
    if req.topic_id:
        topic = forum_service.get_topic(db, req.topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
    
    # Simple deduplication check
    existing = db.query(ReportedContent).filter(
        ReportedContent.reporter_id == current_user.user_id,
        ReportedContent.topic_id == req.topic_id,
        ReportedContent.post_id == req.post_id
    ).first()
    
    if existing:
        return {"detail": "Report submitted successfully"} # Idempotent success
        
    report = ReportedContent(
        reporter_id=current_user.user_id,
        topic_id=req.topic_id,
        post_id=req.post_id,
        reason=req.reason
    )
    db.add(report)
    db.commit()
    return {"detail": "Report submitted successfully"}
