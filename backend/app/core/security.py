import requests
from jose import jwt, JWTError
from app.core.config import settings
from fastapi import HTTPException

# Global cache for JWKS
_jwks_cache = None

def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        region = settings.aws_region
        user_pool_id = settings.cognito_user_pool_id
        if not user_pool_id:
            raise ValueError("COGNITO_USER_POOL_ID is not configured")
        url = f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json"
        _jwks_cache = requests.get(url).json()
    return _jwks_cache


def verify_cognito_token(token: str):
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Token missing kid header")
        
        # Find the matching key in JWKS
        jwks = get_jwks()
        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if not key:
            raise HTTPException(status_code=401, detail="Token kid not found in JWKS")
        
        region = settings.aws_region
        user_pool_id = settings.cognito_user_pool_id
        app_client_id = settings.cognito_app_client_id
        
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=app_client_id,
            issuer=f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}"
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


