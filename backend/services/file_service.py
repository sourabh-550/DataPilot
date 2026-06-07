import pandas as pd
import os
import uuid
from config import UPLOAD_DIR, ALLOWED_EXTENSIONS

def validate_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def get_session_upload_dir(session_id: str) -> str:
    path = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(path, exist_ok=True)
    return path


def save_file(session_id: str, filename: str, content: bytes) -> str:
    upload_dir = get_session_upload_dir(session_id)
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)
    return file_path


def parse_file(file_path: str) -> pd.DataFrame:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".csv":
        return pd.read_csv(file_path)
    elif ext in [".xlsx", ".xls"]:
        return pd.read_excel(file_path)
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