from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import DATABASE_URL

# Supabase/Render give you a plain "postgresql://" URI — SQLAlchemy's async
# engine needs the asyncpg driver explicitly, so we rewrite the scheme here.
# This means you can paste the connection string straight from Supabase
# into .env without editing it.
_db_url = DATABASE_URL
if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(_db_url, echo=False)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False
)

# Base class for all models
class Base(DeclarativeBase):
    pass

# Dependency — used in FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session