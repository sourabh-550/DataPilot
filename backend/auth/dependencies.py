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


async def _user_from_payload(payload: dict, db: AsyncSession):
    """
    Maps verified JWT claims to a DB user. Returns None if the token has no subject.
    Guest (anonymous) users have a real `sub` but an empty `email`, so `sub` is the
    only required claim — email is optional profile data.
    """
    user_id = payload.get("sub")
    if not user_id:
        return None

    is_anonymous = payload.get("is_anonymous", False)
    email = payload.get("email") or None  # anonymous tokens carry email = ""
    metadata = payload.get("user_metadata") or {}
    name = metadata.get("full_name") or metadata.get("name") or ("Guest" if is_anonymous else None)

    return await get_or_create_user(db, email=email, name=name, user_id=user_id)


def ensure_session_access(session, current_user):
    """
    Raises 404 if the dataset session doesn't exist, 403 if it belongs to someone else.
    Sessions created without auth (user_id NULL) stay open to anyone for now.
    """
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id is not None:
        if current_user is None or current_user.id != session.user_id:
            raise HTTPException(status_code=403, detail="You don't have access to this session")


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]
    payload = _decode_token(token)

    user = await _user_from_payload(payload, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Token missing required claims")
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

    return await _user_from_payload(payload, db)