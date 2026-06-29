import pandas as pd
import plotly.express as px
import plotly
import json
from langchain.tools import StructuredTool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from config import GROQ_API_KEY


def create_sql_tool(engine, schema_text: str) -> StructuredTool:

    def nl_to_sql(question: str) -> str:
        """Convert natural language to SQL and execute it."""
        llm = ChatGroq(
            groq_api_key=GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",
            temperature=0
        )

        system = f"""You are a SQL expert. Convert natural language to SQL.

{schema_text}

Rules:
- Only generate SELECT queries
- Use exact table and column names from schema
- Return ONLY the SQL query, nothing else
- No markdown, no explanation, just the SQL query
- Always add LIMIT 100 if no limit specified"""

        response = llm.invoke([
            SystemMessage(content=system),
            HumanMessage(content=question)
        ])

        sql_query = response.content.strip()
        sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
        return sql_query

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
        """Full pipeline: NL → SQL → Execute → Return results."""
        try:
            from services.sql_service import is_safe_query, execute_query

            # Step 1 — Generate SQL
            sql_query = nl_to_sql(question)

            # Step 2 — Safety check
            if not is_safe_query(sql_query):
                return json.dumps({
                    "error": "Generated query contains unsafe operations.",
                    "sql": sql_query
                })

            # Step 3 — Execute query
            df = execute_query(engine, sql_query)

            if df.empty:
                return json.dumps({
                    "sql": sql_query,
                    "message": "Query returned no results.",
                    "rows": [],
                    "columns": [],
                    "chart": None
                })

            # Step 4 — Auto generate chart
            chart = auto_chart(df)

            # Step 5 — Return results
            return json.dumps({
                "sql": sql_query,
                "columns": df.columns.tolist(),
                "rows": df.head(100).to_dict(orient="records"),
                "row_count": len(df),
                "chart": chart
            })

        except Exception as e:
            return json.dumps({"error": str(e)})

    return StructuredTool.from_function(
        func=execute_nl_query,
        name="sql_tool",
        description="Convert natural language to SQL and execute on database. Use for any database questions."
    )