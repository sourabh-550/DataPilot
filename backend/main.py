from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.database import engine, Base
from api.upload import router as upload_router
from api.sql import router as sql_router
from api.chat import router as chat_router
from api.history import router as history_router
from api.profile import router as profile_router
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


@app.get("/")
async def root():
    return {"message": "DataPilot API is running 🚀"}


@app.get("/health")
async def health():
    return {"status": "alive", "service": "DataPilot Backend"}