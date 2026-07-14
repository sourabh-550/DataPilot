from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase #Used to create base class for all DB table
from config import DATABASE_URL

'''Here we are imporitng sqlalchmey asynchronous component
then we use to create the base class for all db tables
instead of writing the db pass inside code its stored in .env'''

_db_url = DATABASE_URL
if _db_url.startswith("postgresql://"):
    '''This works for many PostgreSQL tools.
        But SQLAlchemy's async engine requires a different driver.'''
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

elif _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1) # Some hosting provider use prstgres:// it convert that too

# Create async engine
engine = create_async_engine(_db_url
                             , echo=False)

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