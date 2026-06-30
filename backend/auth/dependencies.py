from fastapi import Header, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import jwt
from jwt import PyJWKClient

from config import SUPABASE_URL
from db.database import get_db
from db.crud import get_or_create_user

JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_jwk_client = PyJWKClient(JWKS_URL)


def _decode_token(token: str) -> dict:
    try:
        signing_key = _jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]
    payload = _decode_token(token)

    user_id = payload.get("sub")
    email = payload.get("email")
    name = payload.get("user_metadata", {}).get("full_name") or payload.get("user_metadata", {}).get("name")

    if not user_id or not email:
        raise HTTPException(status_code=401, detail="Token missing required claims")

    user = await get_or_create_user(db, email=email, name=name, user_id=user_id)
    return user


async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ", 1)[1]
    try:
        payload = _decode_token(token)
    except HTTPException:
        return None

    user_id = payload.get("sub")
    email = payload.get("email")
    name = payload.get("user_metadata", {}).get("full_name") or payload.get("user_metadata", {}).get("name")

    if not user_id or not email:
        return None

    user = await get_or_create_user(db, email=email, name=name, user_id=user_id)
    return user