from fastapi import APIRouter, HTTPException
from typing import List
from app.api.dependencies import SessionDep, CurrentUserDep, AdminUserDep, AgentUserDep
from app.schemas.support import ForumTopicCreate, ForumTopicResponse, UIForumTopicResponse, ForumPostCreate, ForumPostResponse, UIForumPostResponse, OfficialAnswerRequest, TopicLockRequest, ForumTopicUpdate, ForumPostUpdate, ConvertToFAQRequest, FAQCreate, FAQResponse
from app.services import forum_service
from app.crud import faq as faq_crud
from app.services.ai_service import generate_embedding
from app.services.email_service import send_notification_email
from app.models.user import User

router = APIRouter()

@router.get("/topics", response_model=List[UIForumTopicResponse])
def get_topics(db: SessionDep, skip: int = 0, limit: int = 100):
    return forum_service.get_topics(db, skip, limit)

@router.get("/topics/{topic_id}", response_model=UIForumTopicResponse)
def get_topic(topic_id: int, db: SessionDep):
    topic = forum_service.get_topic(db, topic_id)
    if not topic:
         raise HTTPException(status_code=404, detail="Topic not found")
    return topic

@router.post("/topics", response_model=UIForumTopicResponse)
def create_topic(topic: ForumTopicCreate, db: SessionDep, current_user: CurrentUserDep):
    return forum_service.create_topic(db, topic, current_user.user_id)

@router.get("/topics/{topic_id}/posts", response_model=List[UIForumPostResponse])
def get_posts(topic_id: int, db: SessionDep, skip: int = 0, limit: int = 100):
    return forum_service.get_posts_by_topic(db, topic_id, skip, limit)

@router.post("/topics/{topic_id}/posts", response_model=UIForumPostResponse)
def create_post(topic_id: int, post: ForumPostCreate, db: SessionDep, current_user: CurrentUserDep):
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
        new_post = ForumPostCreate(content=req.content, topic_id=topic_id)
        created = forum_service.create_post(db, new_post, agent.user_id)
        post_id_to_mark = created.id
        
    if not post_id_to_mark:
        raise HTTPException(status_code=400, detail="Must provide either content or post_id")
        
    # Mark it as accepted
    post_update = ForumPostUpdate(content=req.content if req.content else "", is_accepted_answer=True)
    # Actually we don't want to overwrite content if only marking.
    # We should get existing post and only update flag.
    existing = forum_service.forum_crud.get_post(db, post_id_to_mark)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
        
    update_data = ForumPostUpdate(content=existing.content, is_accepted_answer=True)
    updated_post = forum_service.update_post(db, post_id_to_mark, update_data)

    # Notify topic author
    topic_author = db.query(User).filter(User.user_id == topic.user_id).first()
    if topic_author and topic_author.email:
        subject = "Your question has been answered on Somba Support"
        html_content = f"An official answer has been posted to your topic: {topic.title}. <br/> View it <a href='https://osomba.com/thread/{topic.id}'>here</a>."
        send_notification_email(topic_author.email, subject, html_content)
        
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
    post = forum_service.forum_crud.get_post(db, req.post_id)
    if not post or post.topic_id != topic_id:
        raise HTTPException(status_code=404, detail="Post not found in this topic")
        
    faq_data = FAQCreate(
        question=req.question,
        answer=post.content,
        is_active=True,
        order_num=0
    )
    embedding = generate_embedding(req.question + " " + post.content)
    created = faq_crud.create_faq(db, faq_data, embedding)
    return created
