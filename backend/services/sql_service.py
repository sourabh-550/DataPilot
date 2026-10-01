import sqlalchemy as sa
from sqlalchemy import text, inspect
import pandas as pd
from typing import Optional
from urllib.request import pathname2url
import os
import re
import sqlite3


def get_engine(connection_type: str, **kwargs):
    """
    Creates database engine based on connection type.
    connection_type: 'sqlite', 'mysql', 'postgresql', 'mssql'
    Raises ValueError for unsupported types.
    """
    SUPPORTED_TYPES = {"sqlite", "mysql", "postgresql", "mssql"}
    if connection_type not in SUPPORTED_TYPES:
        raise ValueError(
            f"Unsupported connection type: '{connection_type}'. "
            f"Supported: {', '.join(sorted(SUPPORTED_TYPES))}"
        )

    if connection_type == "sqlite":
        # Read-only at the database level: even a query that slipped past
        # check_query could not modify the uploaded file.
        #   mode=ro      — SQLite refuses every write
        #   immutable=1  — the file never changes underneath us, so SQLite needs no
        #                  lock/WAL side files (WAL-mode uploads open read-only too)
        uri = f"file:{pathname2url(os.path.abspath(kwargs.get('db_path')))}?mode=ro&immutable=1"
        return sa.create_engine(
            "sqlite://",
            creator=lambda: sqlite3.connect(uri, uri=True, check_same_thread=False),
        )

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


def extract_schema(engine) -> dict:
    """
    Extracts complete schema from database.
    Returns table names, columns, types, and sample rows.
    Uses dialect-aware SQL for sample rows (LIMIT vs TOP).
    """
    inspector = inspect(engine)
    dialect_name = engine.dialect.name  # 'sqlite', 'mysql', 'postgresql', 'mssql'
    schema = {}

    for table_name in inspector.get_table_names():
        columns = []
        for col in inspector.get_columns(table_name):
            columns.append({
                "name": col["name"],
                "type": str(col["type"])
            })

        # Use dialect-appropriate syntax to fetch sample rows
        quoted_name = inspector.engine.dialect.identifier_preparer.quote(table_name)
        if dialect_name == "mssql":
            sample_sql = f"SELECT TOP 3 * FROM {quoted_name}"
        else:
            sample_sql = f"SELECT * FROM {quoted_name} LIMIT 3"

        with engine.connect() as conn:
            result = conn.execute(text(sample_sql))
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


# ── Read-only query guard ─────────────────────────────────────────────────────
# Defense in depth: SQLite files are also opened read-only (get_engine), but live
# databases rely on this check plus the credentials the user connects with.

# Words that write or change things. Checked anywhere in the query, because some
# can hide inside a SELECT: Postgres allows WITH d AS (DELETE ... RETURNING *),
# and SELECT ... INTO creates a table (or, in MySQL, writes a file: INTO OUTFILE).
_WRITE_KEYWORDS = {
    "insert", "update", "delete", "merge", "upsert", "into",
    "drop", "alter", "create", "truncate", "grant", "revoke",
    "exec", "execute", "attach", "detach", "pragma",
}

# Server functions that read files, run commands, reach other servers or stall.
_DANGEROUS_FUNCTIONS = {
    "pg_sleep", "sleep", "benchmark", "pg_read_file", "pg_read_binary_file",
    "pg_ls_dir", "pg_stat_file", "lo_import", "lo_export", "dblink",
    "load_file", "load_extension", "xp_cmdshell", "openrowset", "opendatasource",
    "readfile", "writefile",
}
_FUNCTION_CALL = re.compile(r"\b(" + "|".join(sorted(_DANGEROUS_FUNCTIONS)) + r")\s*\(")
_WORD = re.compile(r"[a-z_][a-z0-9_]*")
_QUOTE_PAIRS = {"'": "'", '"': '"', "`": "`", "[": "]"}


def _blank_out_literals(sql: str):
    """
    Replace string literals, quoted identifiers and comments with a placeholder,
    so a ';' or 'delete' inside them can't fool the checks below.
    Returns (code, None), or (None, reason) for constructs we refuse to guess about.
    """
    out, i, n = [], 0, len(sql)
    while i < n:
        two = sql[i:i + 2]
        if two == "--":  # line comment
            end = sql.find("\n", i)
            i = n if end == -1 else end
            out.append(" ")
            continue
        if two == "/*":  # block comment
            end = sql.find("*/", i + 2)
            if end == -1:
                return None, "unterminated comment"
            if sql[i + 2:i + 3] == "!":
                return None, "MySQL executable comments (/*! */) are not allowed"
            i = end + 2
            out.append(" ")
            continue
        char = sql[i]
        if char in _QUOTE_PAIRS:
            close, j = _QUOTE_PAIRS[char], i + 1
            while True:
                j = sql.find(close, j)
                if j == -1:
                    return None, "unterminated quote"
                if close != "]" and sql[j + 1:j + 2] == close:  # '' / "" = escaped quote
                    j += 2
                    continue
                break
            if "\\" in sql[i + 1:j]:
                # MySQL treats \' as an escaped quote, Postgres doesn't — the two
                # disagree on where the string ends, so refuse rather than guess.
                return None, "backslashes inside strings are not allowed"
            out.append(" x ")  # placeholder keeps the surrounding tokens apart
            i = j + 1
            continue
        if char == "$":
            # Postgres dollar-quoted strings ($$...$$) can hide quotes from this scanner.
            return None, "'$' is not allowed outside strings"
        out.append(char)
        i += 1
    return "".join(out), None


def check_query(query: str):
    """
    Returns None if the query is a single read-only SELECT (or WITH ... SELECT),
    otherwise a short reason it was rejected.
    """
    code, reason = _blank_out_literals(query or "")
    if reason:
        return reason
    code = code.strip().lower()

    # One statement only: allow a single trailing ';' (LLMs often add one), nothing else.
    if code.endswith(";"):
        code = code[:-1].rstrip()
    if ";" in code:
        return "only one statement is allowed"

    words = _WORD.findall(code)
    if not words or words[0] not in ("select", "with"):
        return "only SELECT queries (or WITH ... SELECT) are allowed"

    blocked = next((w for w in words if w in _WRITE_KEYWORDS), None)
    if blocked:
        return f"'{blocked.upper()}' is not allowed in a read-only query"

    call = _FUNCTION_CALL.search(code)
    if call:
        return f"the function '{call.group(1)}' is not allowed"
    return None


def is_safe_query(query: str) -> bool:
    """True if the query is a single read-only SELECT — see check_query for the reason when not."""
    return check_query(query) is None


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
    # Keep only the base name: a client-supplied "../../x.db" must not escape uploads/.
    safe_name = os.path.basename(filename.replace("\\", "/")) or "database.db"
    file_path = os.path.join(upload_dir, safe_name)
    with open(file_path, "wb") as f:
        f.write(content)
    return file_path