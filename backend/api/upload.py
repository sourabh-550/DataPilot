from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from db.crud import create_session
from services.file_service import validate_file, save_file, parse_file, get_file_summary
from services.insight_service import generate_insights
from auth.dependencies import get_current_user_optional
from config import MAX_FILE_SIZE_MB
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    if not validate_file(file.filename):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")

    session_id = str(uuid.uuid4())
    content = await file.read()

    # Validate file size AFTER reading (before expensive processing)
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB."
        )


    try:
        file_path = save_file(session_id, file.filename, content)
        df = parse_file(file_path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    summary = get_file_summary(df)

    file_type = "excel" if file.filename.endswith((".xlsx", ".xls")) else "csv"
    await create_session(
        db=db,
        session_id=session_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file_type,
        row_count=summary["row_count"],
        col_count=summary["col_count"],
        user_id=current_user.id if current_user else None,
    )

    insights = generate_insights(df)

    return {
        "session_id": session_id,
        "file_name": file.filename,
        "summary": summary,
        "insights": insights
    }