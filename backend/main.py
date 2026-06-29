from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.database import engine, Base
from api.upload import router as upload_router
from api.sql import router as sql_router
from api.chat import router as chat_router
import os
import asyncio
import httpx
from config import UPLOAD_DIR

os.makedirs(UPLOAD_DIR, exist_ok=True)

RENDER_URL = "https://datapilot-65m6.onrender.com"

async def keep_alive():
    await asyncio.sleep(60)
    while True:
        try:
            async with httpx.AsyncClient() as client:
                await client.get(f"{RENDER_URL}/health")
                print("✅ Keep-alive ping sent")
        except Exception as e:
            print(f"Keep-alive failed: {e}")
        await asyncio.sleep(840)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    asyncio.create_task(keep_alive())
    yield

app = FastAPI(
    title="DataPilot API",
    description="Enterprise AI Analytics Agent",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(sql_router, prefix="/api", tags=["SQL"])

@app.get("/")
async def root():
    return {"message": "DataPilot API is running 🚀"}

@app.get("/health")
async def health():
    return {"status": "alive", "service": "DataPilot Backend"}