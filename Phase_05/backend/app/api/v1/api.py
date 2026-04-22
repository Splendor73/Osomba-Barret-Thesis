"""
File: api/v1/api.py
Purpose: Aggregates all version 1 API routers into a single `api_router`.
Usage: Included in main.py to register all endpoints.
Architecture: Router Layer - Central hub for API routes.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import admin, ai, auth, categories, faq, forum, search, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(forum.router, prefix="/support", tags=["support"])
api_router.include_router(categories.router, prefix="/support/categories", tags=["support_categories"])
api_router.include_router(faq.router, prefix="/support/faq", tags=["faq"])
api_router.include_router(ai.router, prefix="/support/ai", tags=["ai"])
api_router.include_router(search.router, prefix="/support/search", tags=["search"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
