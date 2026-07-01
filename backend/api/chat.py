from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from db.database import get_db
from db.crud import get_session, save_message, get_chat_history
from services.file_service import parse_file
from agent.core import create_agent
from auth.dependencies import get_current_user_optional

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    message: str


@router.post("/chat")
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):

    # Validate session exists
    session = await get_session(db, request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Ownership check — only enforced once a session actually has an owner.
    # Sessions created without auth (user_id=NULL) stay open to anyone for now.
    if session.user_id is not None:
        if current_user is None or current_user.id != session.user_id:
            raise HTTPException(status_code=403, detail="You don't have access to this session")

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
        answer = f"Agent error: {str(e)}"

    # Check if response contains a chart
    chart_json = None
    if "CHART_JSON:" in answer:
        parts = answer.split("CHART_JSON:")
        answer = parts[0].strip() if parts[0].strip() else "Here is your chart:"
        chart_json = parts[1].strip()

    # Save assistant response to DB
    await save_message(db, request.session_id, "assistant", answer)

    return {
        "answer": answer,
        "chart": chart_json,
        "session_id": request.session_id
    }


@router.get("/chat/history/{session_id}")
async def get_history(session_id: str, db: AsyncSession = Depends(get_db)):
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