import sqlalchemy as sa
from sqlalchemy import text, inspect
import pandas as pd
from typing import Optional
import os


def get_engine(connection_type: str, **kwargs):
    """
    Creates database engine based on connection type.
    connection_type: 'sqlite', 'mysql', 'postgresql', 'mssql'
    """
    if connection_type == "sqlite":
        db_path = kwargs.get("db_path")
        return sa.create_engine(f"sqlite:///{db_path}")

    elif connection_type == "mysql":
        host = kwargs.get("host")
        port = kwargs.get("port", 3306)
        username = kwargs.get("username")
        password = kwargs.get("password")
        database = kwargs.get("database")
        return sa.create_engine(
            f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
        )

    elif connection_type == "postgresql":
        host = kwargs.get("host")
        port = kwargs.get("port", 5432)
        username = kwargs.get("username")
        password = kwargs.get("password")
        database = kwargs.get("database")
        return sa.create_engine(
            f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}"
        )

    elif connection_type == "mssql":
        host = kwargs.get("host")
        username = kwargs.get("username")
        password = kwargs.get("password")
        database = kwargs.get("database")
        return sa.create_engine(
            f"mssql+pyodbc://{username}:{password}@{host}/{database}"
            f"?driver=ODBC+Driver+17+for+SQL+Server"
        )

    raise ValueError(f"Unsupported connection type: {connection_type}")


def extract_schema(engine) -> dict:
    """
    Extracts complete schema from database.
    Returns table names, columns, types, and sample rows.
    """
    inspector = inspect(engine)
    schema = {}

    for table_name in inspector.get_table_names():
        columns = []
        for col in inspector.get_columns(table_name):
            columns.append({
                "name": col["name"],
                "type": str(col["type"])
            })

        # Get sample rows
        with engine.connect() as conn:
            result = conn.execute(
                text(f"SELECT * FROM {table_name} LIMIT 3")
            )
            rows = [dict(row._mapping) for row in result]

        schema[table_name] = {
            "columns": columns,
            "sample_rows": rows
        }

    return schema


def schema_to_text(schema: dict) -> str:
    """
    Converts schema dict to readable text for LLM prompt.
    """
    text_output = "Database Schema:\n\n"
    for table_name, info in schema.items():
        text_output += f"Table: {table_name}\n"
        text_output += "Columns:\n"
        for col in info["columns"]:
            text_output += f"  - {col['name']} ({col['type']})\n"
        text_output += f"Sample rows: {info['sample_rows']}\n\n"
    return text_output


def is_safe_query(query: str) -> bool:
    """
    Safety check — only allow SELECT queries.
    Blocks DROP, DELETE, UPDATE, INSERT, ALTER, CREATE.
    """
    dangerous = [
        "drop", "delete", "update", "insert",
        "alter", "create", "truncate", "exec",
        "execute", "grant", "revoke"
    ]
    query_lower = query.lower().strip()

    # Must start with SELECT
    if not query_lower.startswith("select"):
        return False

    # Must not contain dangerous keywords
    for keyword in dangerous:
        if f" {keyword} " in f" {query_lower} ":
            return False

    return True


def execute_query(engine, query: str) -> pd.DataFrame:
    """
    Executes SQL query and returns result as DataFrame.
    """
    with engine.connect() as conn:
        result = conn.execute(text(query))
        rows = [dict(row._mapping) for row in result]
        return pd.DataFrame(rows)


def save_db_file(session_id: str, filename: str, content: bytes) -> str:
    """
    Saves uploaded .db file to uploads folder.
    """
    upload_dir = os.path.join("uploads", session_id)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)
    return file_path