from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from db.crud import create_session
from services.file_service import validate_file, save_file, parse_file, get_file_summary
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # Validate file type
    if not validate_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported"
        )

    #  Generate unique session ID
    session_id = str(uuid.uuid4())

    # Save file to disk
    content = await file.read()
    file_path = save_file(session_id, file.filename, content)

    #  Parse file with pandas
    df = parse_file(file_path)

    #  Get file summary
    summary = get_file_summary(df)

    # Save session to database
    file_type = "excel" if file.filename.endswith((".xlsx", ".xls")) else "csv"
    await create_session(
        db=db,
        session_id=session_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file_type,
        row_count=summary["row_count"],
        col_count=summary["col_count"]
    )

    return {
        "session_id": session_id,
        "file_name": file.filename,
        "summary": summary
    }