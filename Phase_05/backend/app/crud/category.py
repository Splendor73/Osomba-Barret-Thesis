from sqlalchemy.orm import Session
from app.models.support import ForumCategory
from app.models.support import ForumCategory
from app.schemas.support import ForumCategoryCreate, ForumCategoryUpdate

def get_category(db: Session, category_id: int):
    return db.query(ForumCategory).filter(ForumCategory.id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100, active_only: bool = True):
    q = db.query(ForumCategory)
    if active_only:
        q = q.filter(ForumCategory.is_active == True)
    return q.offset(skip).limit(limit).all()

def create_category(db: Session, category: ForumCategoryCreate):
    db_category = ForumCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category

def update_category(db: Session, category_id: int, category_update: ForumCategoryUpdate):
    db_category = get_category(db, category_id)
    if not db_category:
        return None
    
    update_data = category_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
        
    db.commit()
    db.refresh(db_category)
    return db_category

