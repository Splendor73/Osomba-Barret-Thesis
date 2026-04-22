from datetime import datetime, timezone

from sqlalchemy.orm import Session
from app.models.support import ForumTopic, ForumPost
from app.schemas.support import ForumTopicCreate, ForumTopicUpdate, ForumPostCreate, ForumPostUpdate

# --- Topics ---
def get_topic(db: Session, topic_id: int):
    return (
        db.query(ForumTopic)
        .filter(ForumTopic.id == topic_id, ForumTopic.is_deleted.is_(False))
        .first()
    )

def get_topics(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(ForumTopic)
        .filter(ForumTopic.is_deleted.is_(False))
        .order_by(ForumTopic.is_pinned.desc(), ForumTopic.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_topic(db: Session, topic: ForumTopicCreate, user_id: int, embedding: list = None):
    db_topic = ForumTopic(
        **topic.model_dump(),
        user_id=user_id,
        embedding=embedding
    )
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def update_topic(db: Session, topic_id: int, topic_update: ForumTopicUpdate):
    db_topic = get_topic(db, topic_id)
    if not db_topic:
        return None
    
    update_data = topic_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_topic, key, value)

    db.commit()
    db.refresh(db_topic)
    return db_topic

def delete_topic(db: Session, topic_id: int):
    db_topic = get_topic(db, topic_id)
    if db_topic:
        db_topic.is_deleted = True
        db_topic.deleted_at = datetime.now(timezone.utc)
        db.commit()
    return db_topic

def increment_view_count(db: Session, topic_id: int):
    db_topic = get_topic(db, topic_id)
    if db_topic:
        db_topic.view_count += 1
        db.commit()
    return db_topic

# --- Posts ---
def get_post(db: Session, post_id: int):
    return db.query(ForumPost).filter(ForumPost.id == post_id, ForumPost.is_deleted.is_(False)).first()

def get_posts_by_topic(db: Session, topic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(ForumPost)
        .filter(ForumPost.topic_id == topic_id, ForumPost.is_deleted.is_(False))
        .order_by(ForumPost.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_post(db: Session, post: ForumPostCreate, user_id: int):
    db_post = ForumPost(
        **post.model_dump(),
        user_id=user_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def update_post(db: Session, post_id: int, post_update: ForumPostUpdate):
    db_post = get_post(db, post_id)
    if not db_post:
        return None
    
    update_data = post_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_post, key, value)

    db.commit()
    db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    db_post = get_post(db, post_id)
    if db_post:
        db_post.is_deleted = True
        db_post.deleted_at = datetime.now(timezone.utc)
        db.commit()
    return db_post
