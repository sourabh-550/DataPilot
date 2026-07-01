import pandas as pd
import os
from io import BytesIO
from supabase import create_client, Client
from config import ALLOWED_EXTENSIONS, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_BUCKET

# Single shared client using the SERVICE ROLE key (server-side only — never expose to frontend).
# Storage writes/reads go through this client, bypassing RLS/bucket policies on the backend.
_supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def validate_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def save_file(session_id: str, filename: str, content: bytes) -> str:
    """
    Uploads file bytes to Supabase Storage (bucket = SUPABASE_BUCKET) instead of local disk.
    Returns the storage path — this gets saved in sessions.file_path, same as the old
    local path used to be, so nothing downstream needs to change.
    """
    storage_path = f"{session_id}/{filename}"

    content_type = (
        "text/csv" if filename.lower().endswith(".csv")
        else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    try:
        _supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=storage_path,
            file=content,
            file_options={"content-type": content_type, "upsert": "true"},
        )
    except Exception as e:
        raise ValueError(f"Failed to upload file to storage: {e}")

    return storage_path


def _download_bytes(storage_path: str) -> bytes:
    try:
        return _supabase.storage.from_(SUPABASE_BUCKET).download(storage_path)
    except Exception as e:
        # Most common cause: this session was created before the storage migration,
        # so the file only ever existed on Render's now-wiped local disk.
        raise ValueError(
            "This file is no longer available — it may have been uploaded before "
            "storage was migrated to Supabase. Please re-upload the file to continue."
        ) from e


def parse_file(file_path: str) -> pd.DataFrame:
    """
    file_path is actually the Supabase Storage path (e.g. "{session_id}/{filename}").
    Downloads bytes from Storage and parses in-memory — no local disk involved.
    """
    ext = os.path.splitext(file_path)[1].lower()
    raw = _download_bytes(file_path)

    if ext == ".csv":
        encodings = [
            "utf-8",
            "utf-8-sig",
            "cp1252",
            "latin1",
            "ISO-8859-1",
        ]

        last_error = None
        for encoding in encodings:
            try:
                return pd.read_csv(BytesIO(raw), encoding=encoding)
            except UnicodeDecodeError as e:
                last_error = e
                continue

        raise ValueError(
            f"Unable to read CSV file. Unsupported encoding. Last error: {last_error}"
        )

    elif ext in [".xlsx", ".xls"]:
        return pd.read_excel(BytesIO(raw))

    raise ValueError(f"Unsupported file type: {ext}")


def get_file_summary(df: pd.DataFrame) -> dict:
    return {
        "row_count": len(df),
        "col_count": len(df.columns),
        "columns": [
            {
                "name": col,
                "dtype": str(df[col].dtype),
                "null_count": int(df[col].isnull().sum()),
                "sample_values": df[col].dropna().head(3).tolist()
            }
            for col in df.columns
        ],
        "sample_rows": df.head(5).to_dict(orient="records")
    }