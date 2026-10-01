from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from db.database import get_db
from db.crud import get_session, save_message, get_chat_history
from services.file_service import parse_file
from agent.core import create_agent
from auth.dependencies import get_current_user_optional, ensure_session_access

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="The user's message to the AI agent (max 5000 characters)",
    )


@router.post("/chat")
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):

    session = await get_session(db, request.session_id)
    ensure_session_access(session, current_user)

    # Load the dataframe from file
    try:
        df = parse_file(session.file_path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    #  Save user message to DB
    await save_message(db, request.session_id, "user", request.message)

    #  Create agent and run
    try:
        agent = create_agent(df, request.session_id)
        response = agent.invoke({"input": request.message})
        answer = response.get("output", "Sorry, I could not process that.")
    except Exception as e:
        # Raw errors go to the log only; users get a clean message.
        print(f"Chat agent crashed: {type(e).__name__}: {e}")
        answer = "Sorry, something went wrong while analyzing your data. Please try again."

    # Check if response contains a chart
    chart_json = None
    if "CHART_JSON:" in answer:
        parts = answer.split("CHART_JSON:")
        answer = parts[0].strip() if parts[0].strip() else "Here is your chart:"
        chart_json = parts[1].strip()

    # Save assistant response to DB — tag chart replies so the dashboard can count them
    await save_message(
        db, request.session_id, "assistant", answer,
        tool_used="chart" if chart_json else None,
    )

    return {
        "answer": answer,
        "chart": chart_json,
        "session_id": request.session_id
    }


@router.get("/chat/history/{session_id}")
async def get_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    # Same ownership rule as sending a message — chat logs are private.
    ensure_session_access(await get_session(db, session_id), current_user)
    history = await get_chat_history(db, session_id)
    return {
        "history": [
            {
                "role": msg.role,
                "message": msg.message,
                "tool_used": msg.tool_used
            }
            for msg in history
        ]
    }