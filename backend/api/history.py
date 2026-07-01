from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete as sa_delete
from db.database import get_db
from db.models import Session, ChatHistory
from auth.dependencies import get_current_user_optional
from datetime import datetime

router = APIRouter()


@router.get("/history")
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    if not current_user:
        # Not logged in — return empty, frontend falls back to localStorage
        return {"sessions": [], "total": 0}

    result = await db.execute(
        select(Session)
        .where(Session.user_id == current_user.id)
        .order_by(Session.created_at.desc())
    )
    sessions = result.scalars().all()

    return {
        "sessions": [
            {
                "session_id": s.id,
                "file_name": s.file_name,
                "file_type": s.file_type,
                "row_count": s.row_count,
                "col_count": s.col_count,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in sessions
        ],
        "total": len(sessions)
    }


@router.delete("/history/{session_id}")
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.execute(
        select(Session).where(
            Session.id == session_id,
            Session.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Delete child chat_history rows first — they have a FK to sessions.id
    # with no ON DELETE CASCADE configured, so deleting the session directly
    # fails if it has any chat messages.
    await db.execute(
        sa_delete(ChatHistory).where(ChatHistory.session_id == session_id)
    )
    await db.delete(session)
    await db.commit()
    return {"deleted": session_id}