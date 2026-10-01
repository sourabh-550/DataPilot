from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone
from db.database import get_db
from db.models import Session, ChatHistory
from auth.dependencies import get_current_user_optional

router = APIRouter()

RECENT_ACTIVITY_LIMIT = 6
QUESTION_PREVIEW_CHARS = 80


def _iso_utc(dt):
    # created_at is stored as naive UTC — tag it so browsers don't parse it as local time.
    return dt.replace(tzinfo=timezone.utc).isoformat() if dt else None


@router.get("/dashboard")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    """Real per-user stats and recent activity, built from sessions + chat_history."""
    if not current_user:
        return {
            "stats": {"datasets": 0, "rows_uploaded": 0, "questions": 0, "charts": 0},
            "recent_activity": [],
        }

    user_id = current_user.id

    dataset_count, rows_uploaded = (await db.execute(
        select(func.count(Session.id), func.coalesce(func.sum(Session.row_count), 0))
        .where(Session.user_id == user_id)
    )).one()

    # Chat messages belong to a user through their session.
    user_messages = (
        select(func.count(ChatHistory.id))
        .join(Session, ChatHistory.session_id == Session.id)
        .where(Session.user_id == user_id)
    )
    questions = await db.scalar(user_messages.where(ChatHistory.role == "user"))
    charts = await db.scalar(
        user_messages.where(ChatHistory.role == "assistant", ChatHistory.tool_used == "chart")
    )

    recent_uploads = (await db.execute(
        select(Session.file_name, Session.row_count, Session.created_at)
        .where(Session.user_id == user_id)
        .order_by(Session.created_at.desc())
        .limit(RECENT_ACTIVITY_LIMIT)
    )).all()

    recent_questions = (await db.execute(
        select(ChatHistory.message, ChatHistory.created_at, Session.file_name)
        .join(Session, ChatHistory.session_id == Session.id)
        .where(Session.user_id == user_id, ChatHistory.role == "user")
        .order_by(ChatHistory.created_at.desc())
        .limit(RECENT_ACTIVITY_LIMIT)
    )).all()

    activity = [
        {"type": "upload", "file_name": r.file_name, "row_count": r.row_count, "created_at": r.created_at}
        for r in recent_uploads
    ] + [
        {"type": "question", "file_name": q.file_name, "text": q.message[:QUESTION_PREVIEW_CHARS], "created_at": q.created_at}
        for q in recent_questions
    ]
    activity.sort(key=lambda a: a["created_at"] or datetime.min, reverse=True)
    activity = activity[:RECENT_ACTIVITY_LIMIT]
    for a in activity:
        a["created_at"] = _iso_utc(a["created_at"])

    return {
        "stats": {
            "datasets": dataset_count,
            "rows_uploaded": int(rows_uploaded),
            "questions": questions or 0,
            "charts": charts or 0,
        },
        "recent_activity": activity,
    }
