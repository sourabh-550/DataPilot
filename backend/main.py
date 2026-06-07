from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.database import engine, Base
from api.upload import router as upload_router
import os
from config import UPLOAD_DIR

# Create upload directory if not exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create DB tables on startup
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

# CORS — allows React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(upload_router, prefix="/api", tags=["Upload"])

@app.get("/")
async def root():
    return {"message": "DataPilot API is running 🚀"}