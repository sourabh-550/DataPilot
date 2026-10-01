from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from contextlib import asynccontextmanager
from db.database import engine, Base
from api.upload import router as upload_router
from api.sql import router as sql_router
from api.chat import router as chat_router
from api.history import router as history_router
from api.profile import router as profile_router
from api.dashboard import router as dashboard_router
import os
import asyncio
import httpx
from config import UPLOAD_DIR

os.makedirs(UPLOAD_DIR, exist_ok=True)

RENDER_URL = "https://datapilot-65m6.onrender.com"


async def keep_alive(): # Prevent Render from sleeping
    await asyncio.sleep(60) #Wait 60 sec after startup
    while True:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.get(f"{RENDER_URL}/health")
                print("✅ Keep-alive ping sent")
        except Exception as e:
            print(f"Keep-alive failed: {e}")
        await asyncio.sleep(840)


@asynccontextmanager #this create startup/shutdown lifecycle management
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # ^ This creates the database tables if they don't exist yet.
    asyncio.create_task(keep_alive())
    #^ Starts a background task that keeps the server alive on Render.

    yield


app = FastAPI(
    title="DataPilot API",
    description="Enterprise AI Analytics Agent",
    version="1.0.0",
    lifespan=lifespan
)

ALLOWED_ORIGINS = [
    "https://datapilot-one.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(sql_router, prefix="/api", tags=["SQL"])
app.include_router(history_router, prefix="/api", tags=["History"])
app.include_router(profile_router, prefix="/api", tags=["Profile"])
app.include_router(dashboard_router, prefix="/api", tags=["Dashboard"])


@app.get("/")
async def root():
    return {"message": "DataPilot API is running 🚀"}


HEALTH_DB_TIMEOUT_SECONDS = 5


async def _ping_database():
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))


# Called every few minutes by an external monitor (UptimeRobot / cron-job.org).
# The real query keeps Supabase active as well as Render, and makes the check
# honest: it returns 503 if the database is unreachable, so the monitor alerts.
# HEAD is accepted because some monitors send HEAD instead of GET.
@app.api_route("/health", methods=["GET", "HEAD"])
async def health(response: Response):
    try:
        await asyncio.wait_for(_ping_database(), timeout=HEALTH_DB_TIMEOUT_SECONDS)
        return {"status": "alive", "service": "DataPilot Backend", "database": "ok"}
    except Exception as e:
        print(f"Health check: database unreachable: {e!r}")
        response.status_code = 503
        return {"status": "degraded", "service": "DataPilot Backend", "database": "unreachable"}