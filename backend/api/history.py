from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete as sa_delete
from db.database import get_db
from db.models import Session, ChatHistory
from db.crud import get_session
from auth.dependencies import get_current_user_optional, ensure_session_access
from services.file_service import parse_file, get_file_summary
from services.time_utils import to_utc_iso

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
                "created_at": to_utc_iso(s.created_at),
            }
            for s in sessions
        ],
        "total": len(sessions)
    }


@router.get("/sessions/{session_id}")
async def get_session_detail(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    """
    Same shape as the POST /upload response, so the Chat and Explorer pages can
    reopen a dataset from History, a page refresh or a bookmarked URL.
    """
    session = await get_session(db, session_id)
    ensure_session_access(session, current_user)

    try:
        df = parse_file(session.file_path)
    except ValueError as e:
        # File is gone from storage (e.g. uploaded before the storage migration)
        raise HTTPException(status_code=410, detail=str(e))

    return {
        "session_id": session.id,
        "file_name": session.file_name,
        "summary": get_file_summary(df),
        "insights": [],  # insights aren't stored yet — they're generated once, at upload
        "created_at": to_utc_iso(session.created_at),
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