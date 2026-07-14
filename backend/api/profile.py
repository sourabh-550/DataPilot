from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from db.database import get_db
from db.crud import update_user_profile
from auth.dependencies import get_current_user

router = APIRouter()


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None


@router.get("/profile")
async def get_profile(current_user = Depends(get_current_user)):
    return {
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "company": current_user.company,
    }


@router.put("/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    updated_user = await update_user_profile(
        db=db,
        user_id=current_user.id,
        name=request.name,
        role=request.role,
        company=request.company,
    )

    return {
        "name": updated_user.name,
        "email": updated_user.email,
        "role": updated_user.role,
        "company": updated_user.company,
    }