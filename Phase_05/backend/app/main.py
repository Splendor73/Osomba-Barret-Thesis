"""
File: main.py
Purpose: Backend application entry point. Configures FastAPI, CORS, and Database tables.
Usage: Run via uvicorn (e.g., `uvicorn app.main:app`).
Architecture: Root level - App configuration and Middleware.
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.exceptions import (
    NotFoundException,
    PermissionDeniedException,
    BusinessRuleViolationException,
    AuthenticationException
)

from app.db.database import engine
from app.db.base import Base
from sqlalchemy import inspect

app = FastAPI(title="Osomba API", version="1.0.0")

# CORS middleware MUST be added before anything else to catch 404s and redirects
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
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

# Create database tables (with error handling for AWS deployment)
try:
    # Check if we have any tables already
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    # Compare with our Base metadata to find missing tables
    tables_to_create = []
    for table_name, table_object in Base.metadata.tables.items():
        if table_name not in existing_tables:
            tables_to_create.append(table_object)

    if tables_to_create:
        missing_names = [t.name for t in tables_to_create]
        print(f"Found missing tables: {missing_names}. Creating them now...")
        
        # We pass the specific list of missing tables to create_all
        Base.metadata.create_all(bind=engine, tables=tables_to_create)
        print("Missing tables created successfully.")
    else:
        print("All database tables already exist. Skipping creation.")
        
except Exception as e:
    print(f"Warning: Database initialization failed: {e}")
    # Continue anyway - app will still start

# Removed duplicated CORS middleware from bottom

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Welcome to Osomba API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/init-db")
def init_db():
    Base.metadata.create_all(bind=engine)
    return {"status": "Database initialized"}

