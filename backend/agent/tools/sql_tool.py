import datetime
import json
import math
from decimal import Decimal

import pandas as pd
import plotly.express as px
import plotly
from langchain.tools import StructuredTool
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from services.llm import get_llm, ask_llm

# Module-level LLM instance — shared across all SQL tool calls. JSON mode
# ({"sql": ...}) avoids gpt-oss's intermittent tool_use_failed on plain-text replies.
_llm = get_llm(temperature=0, json_mode=True)

# After the first attempt, a failing query is sent back to the LLM with the
# database's error message up to this many times (so 3 queries in total).
MAX_CORRECTIONS = 2

_DIALECT_NAMES = {
    "sqlite": "SQLite",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mssql": "Microsoft SQL Server (T-SQL)",
}

_BLOCKED_MESSAGE = "This request was blocked: only read-only SELECT queries are allowed"


def _dialect_rules(dialect: str) -> str:
    name = _DIALECT_NAMES.get(dialect, dialect)
    if dialect == "mssql":
        limit_rule = "- Limit rows with SELECT TOP 100 ... — T-SQL has no LIMIT clause"
    else:
        limit_rule = "- Add LIMIT 100 at the end if no limit is specified"
    return f"- The database is {name}: use only {name} syntax and functions\n{limit_rule}"


def _db_error_message(e: Exception) -> str:
    """The driver's own message (e.g. 'no such column: revenue'), without SQLAlchemy's SQL dump."""
    original = getattr(e, "orig", None)
    text = str(original) if original is not None else str(e)
    return text.strip().split("\n")[0][:300]


def _json_cell(value):
    """DB values → JSON-safe: NULL/NaN/inf → null, Decimal → float, dates → ISO strings."""
    if value is None:
        return None
    if isinstance(value, float):  # includes numpy float64
        return None if math.isnan(value) or math.isinf(value) else value
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime.date, datetime.time)):  # includes datetime, pd.Timestamp
        return value.isoformat()
    if pd.isna(value):  # NaT and friends
        return None
    if hasattr(value, "item"):  # numpy int/bool scalars → Python
        return value.item()
    return value


def create_sql_tool(engine, schema_text: str) -> StructuredTool:
    dialect = engine.dialect.name  # 'sqlite', 'postgresql', 'mysql', 'mssql'

    def nl_to_sql(question: str, failed_attempts: list) -> str:
        """Ask the LLM for SQL. Earlier failures are replayed so it can correct itself."""
        system = f"""You are a SQL expert. Convert natural language to SQL.

{schema_text}

Rules:
- Only generate a single SELECT query (a WITH ... SELECT is fine)
- Use exact table and column names from the schema
{_dialect_rules(dialect)}
- Reply ONLY with JSON: {{"sql": "<the query>"}}"""

        messages = [SystemMessage(content=system), HumanMessage(content=question)]
        for attempt in failed_attempts:
            messages.append(AIMessage(content=json.dumps({"sql": attempt["sql"]})))
            messages.append(HumanMessage(content=(
                f"That query failed with this database error:\n{attempt['error']}\n"
                "Fix the query. Reply ONLY with JSON: {\"sql\": \"<the corrected query>\"}"
            )))

        raw = ask_llm(_llm, messages)
        try:
            sql_query = json.loads(raw).get("sql") or ""
        except (ValueError, AttributeError):
            sql_query = raw  # not JSON — treat the whole reply as SQL
        return sql_query.replace("```sql", "").replace("```", "").strip()

    def auto_chart(df: pd.DataFrame) -> str:
        """Auto generates best chart for query result."""
        if df.empty or len(df.columns) < 2:
            return None

        try:
            # Find numeric and text columns
            num_cols = df.select_dtypes(include=['number']).columns.tolist()
            str_cols = df.select_dtypes(include=['object']).columns.tolist()

            if str_cols and num_cols:
                fig = px.bar(
                    df,
                    x=str_cols[0],
                    y=num_cols[0],
                    title=f"{num_cols[0]} by {str_cols[0]}"
                )
                return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        except Exception:
            pass
        return None

    def execute_nl_query(question: str) -> str:
        """
        NL → SQL → safety check → execute, with self-correction: if the database
        rejects the query, its error goes back to the LLM for a fixed query, up to
        MAX_CORRECTIONS times. Failed attempts are returned so the UI can show them.
        """
        from services.sql_service import check_query, execute_query

        failed = []  # [{"sql": ..., "error": ...}] — every attempt that didn't work
        try:
            for _ in range(1 + MAX_CORRECTIONS):
                sql_query = nl_to_sql(question, failed)

                # A safety block is final: retrying would only produce some other
                # query, not what the user asked for.
                blocked_reason = check_query(sql_query)
                if blocked_reason:
                    return json.dumps({
                        "error": f"{_BLOCKED_MESSAGE} ({blocked_reason})",
                        "sql": sql_query,
                        "attempts": failed,
                    })

                try:
                    df = execute_query(engine, sql_query)
                except Exception as e:
                    failed.append({"sql": sql_query, "error": _db_error_message(e)})
                    continue

                rows = [
                    {col: _json_cell(v) for col, v in row.items()}
                    for row in df.head(100).to_dict(orient="records")
                ]
                return json.dumps({
                    "sql": sql_query,
                    "columns": df.columns.tolist(),
                    "rows": rows,
                    "row_count": len(df),
                    "chart": auto_chart(df),
                    "attempts": failed,
                }, default=str)

            return json.dumps({
                "error": f"I couldn't write a working query after {len(failed)} attempts. "
                         f"Last database error: {failed[-1]['error']}",
                "sql": failed[-1]["sql"],
                "attempts": failed,
            })

        except Exception as e:
            # LLMUnavailableError's text is already user-safe.
            return json.dumps({"error": str(e), "attempts": failed})

    return StructuredTool.from_function(
        func=execute_nl_query,
        name="sql_tool",
        description="Convert natural language to SQL and execute on database. Use for any database questions."
    )
