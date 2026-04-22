"""
File: main.py
Purpose: Backend application entry point. Configures FastAPI, CORS, and Database tables.
Usage: Run via uvicorn (e.g., `uvicorn app.main:app`).
Architecture: Root level - App configuration and Middleware.
"""
from fastapi import APIRouter, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.exceptions import (
    AuthenticationException,
    BusinessRuleViolationException,
    NotFoundException,
    PermissionDeniedException,
)
from app.db import base  # noqa: F401
from app.db.database import engine
from app.models.support import AiQueryLog, FAQ, ForumCategory, ForumPost, ForumTopic, SUPPORT_SCHEMA, SupportUserRoleAssignment, ReportedContent

support_api_prefix = settings.SUPPORT_API_PREFIX.rstrip("/")
if support_api_prefix and not support_api_prefix.startswith("/"):
    support_api_prefix = f"/{support_api_prefix}"

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url=f"{support_api_prefix}/docs" if support_api_prefix else "/docs",
    openapi_url=f"{support_api_prefix}/openapi.json" if support_api_prefix else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message},
    )

@app.exception_handler(PermissionDeniedException)
async def permission_denied_exception_handler(request: Request, exc: PermissionDeniedException):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": exc.message},
    )

@app.exception_handler(BusinessRuleViolationException)
async def business_rule_exception_handler(request: Request, exc: BusinessRuleViolationException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message},
    )

@app.exception_handler(AuthenticationException)
async def authentication_exception_handler(request: Request, exc: AuthenticationException):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": exc.message},
    )

try:
    support_tables = [
        ForumCategory.__table__,
        ForumTopic.__table__,
        ForumPost.__table__,
        FAQ.__table__,
        AiQueryLog.__table__,
        SupportUserRoleAssignment.__table__,
        ReportedContent.__table__,
    ]
    with engine.begin() as connection:
        # Support tables use pgvector embeddings, so ensure the extension exists first.
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        connection.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SUPPORT_SCHEMA}"))
        for table in support_tables:
            table.create(bind=connection, checkfirst=True)
except Exception as e:
    print(f"Warning: Database initialization failed: {e}")

api_root = APIRouter(prefix=support_api_prefix) if support_api_prefix else APIRouter()
api_root.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_root)

@app.get("/")
def read_root():
    return {"message": "Welcome to Osomba Support API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

if support_api_prefix:
    @app.get(f"{support_api_prefix}/")
    def read_prefixed_root():
        return read_root()


    @app.get(f"{support_api_prefix}/health")
    def prefixed_health_check():
        return health_check()
