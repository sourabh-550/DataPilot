from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from services.sql_service import (
    get_engine, extract_schema, schema_to_text,
    save_db_file, execute_query, is_safe_query
)
from agent.tools.sql_tool import create_sql_tool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from config import GROQ_API_KEY
from db.database import get_db
from auth.dependencies import get_current_user_optional
import json
import uuid

router = APIRouter()

# In-memory session store for SQL sessions
# TODO V2: migrate to DB-backed sql_sessions table (same as sessions/chat_history)
# so SQL sessions survive server restarts and are tied to user accounts properly
sql_sessions = {}


class ConnectionRequest(BaseModel):
    connection_type: str      # mysql, postgresql, mssql
    host: str
    port: Optional[int] = None
    username: str
    password: str
    database: str


class SQLChatRequest(BaseModel):
    session_id: str
    message: str


# ── Endpoint 1 — Upload SQLite .db file ──────────────────────

@router.post("/sql/upload-db")
async def upload_db(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    if not file.filename.endswith(".db"):
        raise HTTPException(
            status_code=400,
            detail="Only .db (SQLite) files supported"
        )

    session_id = str(uuid.uuid4())
    content = await file.read()
    file_path = save_db_file(session_id, file.filename, content)

    try:
        engine = get_engine("sqlite", db_path=file_path)
        schema = extract_schema(engine)
        schema_text = schema_to_text(schema)

        sql_sessions[session_id] = {
            "engine": engine,
            "schema": schema,
            "schema_text": schema_text,
            "connection_type": "sqlite",
            "db_name": file.filename,
            # TODO V2: persist to DB with user_id so sessions survive restarts
            "user_id": current_user.id if current_user else None,
        }

        return {
            "session_id": session_id,
            "db_name": file.filename,
            "schema": schema,
            "table_count": len(schema),
            "tables": list(schema.keys())
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Endpoint 2 — Connect via connection string ────────────────

@router.post("/sql/connect")
async def connect_db(
    request: ConnectionRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    session_id = str(uuid.uuid4())

    try:
        engine = get_engine(
            request.connection_type,
            host=request.host,
            port=request.port,
            username=request.username,
            password=request.password,
            database=request.database
        )

        # Test connection
        with engine.connect() as conn:
            conn.execute(__import__('sqlalchemy').text("SELECT 1"))

        schema = extract_schema(engine)
        schema_text = schema_to_text(schema)

        sql_sessions[session_id] = {
            "engine": engine,
            "schema": schema,
            "schema_text": schema_text,
            "connection_type": request.connection_type,
            "db_name": request.database,
            # TODO V2: persist to DB with user_id so sessions survive restarts
            "user_id": current_user.id if current_user else None,
        }

        return {
            "session_id": session_id,
            "db_name": request.database,
            "schema": schema,
            "table_count": len(schema),
            "tables": list(schema.keys())
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(e)}")


# ── Endpoint 3 — Natural Language Chat ───────────────────────

@router.post("/sql/chat")
async def sql_chat(
    request: SQLChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    session = sql_sessions.get(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="SQL session not found")

    # Ownership check — only enforced once SQL sessions are DB-backed (V2)
    # For now, in-memory sessions are scoped to the server process only,
    # so a session_id from another user would just 404 naturally (not in memory)
    # TODO V2: check session["user_id"] == current_user.id once DB-backed

    try:
        sql_tool = create_sql_tool(
            engine=session["engine"],
            schema_text=session["schema_text"]
        )

        result_str = sql_tool.func(request.message)
        result = json.loads(result_str)

        if "error" in result:
            return {
                "answer": f"Error: {result['error']}",
                "sql": result.get("sql", ""),
                "table": None,
                "chart": None
            }

        return {
            "answer": f"Query executed successfully. Found {result.get('row_count', 0)} rows.",
            "sql": result.get("sql", ""),
            "table": {
                "columns": result.get("columns", []),
                "rows": result.get("rows", [])
            },
            "chart": result.get("chart", None)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Endpoint 4 — Get Schema ───────────────────────────────────

@router.get("/sql/schema/{session_id}")
async def get_schema(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    session = sql_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "schema": session["schema"],
        "tables": list(session["schema"].keys())
    }