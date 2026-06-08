from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.database import engine, Base
from api.upload import router as upload_router
from api.chat import router as chat_router        # ← ADD THIS
import os
from config import UPLOAD_DIR

os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="DataPilot API",
    description="Enterprise AI Analytics Agent",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # ← add 5174
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])   # ← ADD THIS

@app.get("/")
async def root():
    return {"message": "DataPilot API is running 🚀"}