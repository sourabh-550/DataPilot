from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models import Session, ChatHistory, User
from datetime import datetime, timedelta
from config import SESSION_EXPIRY_HOURS
import uuid

# Users

async def create_user(db: AsyncSession, email: str, name: str = None, user_id: str = None):
    user = User(
        id=user_id or str(uuid.uuid4()),
        email=email,
        name=name
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_id(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(
        select(User).where(User.email == email)
    )
    return result.scalar_one_or_none()


async def get_or_create_user(db: AsyncSession, email: str, name: str = None, user_id: str = None):
    existing = await get_user_by_email(db, email)
    if existing:
        return existing
    return await create_user(db, email=email, name=name, user_id=user_id)


async def update_user_profile(
    db: AsyncSession,
    user_id: str,
    name: str = None,
    role: str = None,
    company: str = None,
):
    user = await get_user_by_id(db, user_id)
    if not user:
        return None

    if name is not None:
        user.name = name
    if role is not None:
        user.role = role
    if company is not None:
        user.company = company

    await db.commit()
    await db.refresh(user)
    return user


# Sessions

async def create_session(db: AsyncSession, session_id: str, file_name: str,
                          file_path: str, file_type: str,
                          row_count: int, col_count: int, user_id: str = None):
    session = Session(
        id=session_id,
        user_id=user_id,
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