"""
File: api/v1/api.py
Purpose: Aggregates all version 1 API routers into a single `api_router`.
Usage: Included in main.py to register all endpoints.
Architecture: Router Layer - Central hub for API routes.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, products, auctions, orders, messages, notifications, reviews, payments, users, forum, categories, faq, admin, ai, search

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(auctions.router, prefix="/auctions", tags=["auctions"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(forum.router, prefix="/support", tags=["support"])
api_router.include_router(categories.router, prefix="/support/categories", tags=["support_categories"])
api_router.include_router(faq.router, prefix="/support/faq", tags=["faq"])
api_router.include_router(ai.router, prefix="/support/ai", tags=["ai"])
api_router.include_router(search.router, prefix="/support/search", tags=["search"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
