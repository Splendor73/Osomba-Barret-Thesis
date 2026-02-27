from typing import Annotated
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, UTC
from app.db.database import get_db
from app.models.user import User
from app.core.security import verify_cognito_token
from app.services.product_service import ProductService
from app.services.order_service import OrderService
from app.services.auth_service import AuthService
from app.services.auction_service import AuctionService

security = HTTPBearer()

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Authenticates the user via Cognito JWT.
    Delegates JIT (Just-In-Time) provisioning to AuthService.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Verify Token
    try:
        payload = verify_cognito_token(credentials.credentials)
    except Exception as e:
        print(f"Token verification failed: {e}")
        raise credentials_exception
        
    sub = payload.get("sub")
    email = payload.get("email")
    
    if not sub:
        raise credentials_exception

    # 2. Extract JIT Parameters (Optional)
    terms_version = None
    marketing_opt_in = False
    
    try:
        # Check if body is available and parseable
        # Be careful: Request stream can only be consumed once. 
        # But get_current_user is usually first.
        # Alternatively, we can let AuthService fetch user by SUB first
        # and only parse body if user is missing (handled inside AuthService? No, Service shouldn't read Request).
        
        # NOTE: FastAPI Dependency reads body... this might consume it for the endpoint.
        # For now, we keep the previous behavior: try to read body for JIT.
        # Ideally, JIT data should be in Headers or a dedicated /onboard endpoint.
        # But for backward compatibility with current frontend:
        body_bytes = await request.body()
        if body_bytes:
             # We need to restore the body for the endpoint to use
             # Starlette Request.body() is cached, so awaiting it multiple times is safe?
             # Yes, if we use request.json() it caches.
             body = await request.json()
             if isinstance(body, dict):
                 terms_version = body.get("terms_version")
                 marketing_opt_in = body.get("marketing_opt_in", False)
    except Exception:
        # Body parsing failed or empty, proceed without JIT params
        pass

    # 3. Delegate to AuthService (Preserving Refactored Architecture)
    auth_service = AuthService(db)
    try:
        user = auth_service.get_or_provision_user(
            sub=sub, 
            email=email, 
            terms_version=terms_version, 
            marketing_opt_in=marketing_opt_in
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed during provisioning: {str(e)}"
        )
        
    return user


# Service Providers & Aliases
SessionDep = Annotated[Session, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]

def get_product_service(db: SessionDep) -> ProductService:
    return ProductService(db)

def get_order_service(db: SessionDep) -> OrderService:
    return OrderService(db)

def get_auth_service(db: SessionDep) -> AuthService:
    return AuthService(db)

def get_auction_service(db: SessionDep) -> AuctionService:
    return AuctionService(db)

ProductServiceDep = Annotated[ProductService, Depends(get_product_service)]
OrderServiceDep = Annotated[OrderService, Depends(get_order_service)]
AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
AuctionServiceDep = Annotated[AuctionService, Depends(get_auction_service)]
