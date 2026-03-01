from sqlalchemy.orm import Session
from app.crud import forum as forum_crud
from app.crud import category as category_crud
from app.crud import category as category_crud
from app.schemas.support import ForumTopicCreate, ForumTopicUpdate, ForumPostCreate, ForumPostUpdate, ForumCategoryCreate, ForumCategoryUpdate
from app.services.ai_service import generate_embedding

# --- Categories ---
def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return category_crud.get_categories(db, skip=skip, limit=limit)

def create_category(db: Session, category: ForumCategoryCreate):
    return category_crud.create_category(db, category=category)

def delete_category(db: Session, category_id: int):
    return category_crud.delete_category(db, category_id=category_id)

def update_category(db: Session, category_id: int, category_update: ForumCategoryUpdate):
    return category_crud.update_category(db, category_id=category_id, category_update=category_update)

# --- Topics ---
def get_topics(db: Session, skip: int = 0, limit: int = 100):
    return forum_crud.get_topics(db, skip=skip, limit=limit)

def get_topic(db: Session, topic_id: int):
    # Also increments view count
    topic = forum_crud.increment_view_count(db, topic_id)
    return topic

def create_topic(db: Session, topic: ForumTopicCreate, user_id: int):
    # Content and Title represent the search vector
    text_to_encode = f"{topic.title} {topic.content}"
    embedding = generate_embedding(text_to_encode)
    return forum_crud.create_topic(db, topic=topic, user_id=user_id, embedding=embedding)

def update_topic(db: Session, topic_id: int, topic_update: ForumTopicUpdate):
    return forum_crud.update_topic(db, topic_id=topic_id, topic_update=topic_update)

def delete_topic(db: Session, topic_id: int):
    return forum_crud.delete_topic(db, topic_id=topic_id)


# --- Posts (Replies) ---
def get_posts_by_topic(db: Session, topic_id: int, skip: int = 0, limit: int = 100):
    return forum_crud.get_posts_by_topic(db, topic_id, skip=skip, limit=limit)

def create_post(db: Session, post: ForumPostCreate, user_id: int):
    return forum_crud.create_post(db, post=post, user_id=user_id)

def update_post(db: Session, post_id: int, post_update: ForumPostUpdate):
    return forum_crud.update_post(db, post_id=post_id, post_update=post_update)

def delete_post(db: Session, post_id: int):
    return forum_crud.delete_post(db, post_id=post_id)
