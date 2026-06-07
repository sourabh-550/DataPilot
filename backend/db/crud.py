from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models import Session, ChatHistory
from datetime import datetime, timedelta
from config import SESSION_EXPIRY_HOURS

# Sessions 

async def create_session(db: AsyncSession, session_id: str, file_name: str,
                          file_path: str, file_type: str,
                          row_count: int, col_count: int):
    session = Session(
        id=session_id,
        file_name=file_name,
        file_path=file_path,
        file_type=file_type,
        row_count=row_count,
        col_count=col_count,
        expires_at=datetime.utcnow() + timedelta(hours=SESSION_EXPIRY_HOURS)
    )
    db.add(session)
    await db.commit()
    return session


async def get_session(db: AsyncSession, session_id: str):
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    return result.scalar_one_or_none()


# Chat History 
async def save_message(db: AsyncSession, session_id: str,
                        role: str, message: str, tool_used: str = None):
    chat = ChatHistory(
        session_id=session_id,
        role=role,
        message=message,
        tool_used=tool_used
    )
    db.add(chat)
    await db.commit()
    return chat


async def get_chat_history(db: AsyncSession, session_id: str):
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.session_id == session_id)
        .order_by(ChatHistory.created_at.asc())
    )
    return result.scalars().all()