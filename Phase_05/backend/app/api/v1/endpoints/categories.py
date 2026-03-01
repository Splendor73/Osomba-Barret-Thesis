from fastapi import APIRouter
from typing import List
from app.api.dependencies import SessionDep, AdminUserDep
from app.schemas.support import ForumCategoryCreate, ForumCategoryResponse, ForumCategoryUpdate
from app.services import forum_service

router = APIRouter()

@router.get("/", response_model=List[ForumCategoryResponse])
def get_categories(db: SessionDep, skip: int = 0, limit: int = 100):
    return forum_service.get_categories(db, skip, limit)

@router.post("/", response_model=ForumCategoryResponse)
def create_category(category: ForumCategoryCreate, db: SessionDep, admin: AdminUserDep):
    return forum_service.create_category(db, category)

@router.delete("/{category_id}")
def delete_category(category_id: int, db: SessionDep, admin: AdminUserDep):
    category = forum_service.delete_category(db, category_id)
    return {"status": "deleted", "id": category.id} if category else {"status": "not found"}

@router.put("/{category_id}", response_model=ForumCategoryResponse)
def update_category(category_id: int, category_update: ForumCategoryUpdate, db: SessionDep, admin: AdminUserDep):
    from fastapi import HTTPException
    category = forum_service.update_category(db, category_id, category_update)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
