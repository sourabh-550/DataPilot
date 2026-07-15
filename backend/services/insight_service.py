import pandas as pd
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from config import GROQ_API_KEY
import json
import math

# Module-level LLM instance — avoids re-creating the client on every upload request.
_llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama-3.1-8b-instant",
    temperature=0.3,
)


def _safe_stat(value) -> str:
    """Format a numeric stat safely, returning 'N/A' for NaN/Inf values."""
    try:
        if value is None or (isinstance(value, float) and (math.isnan(value) or math.isinf(value))):
            return "N/A"
        return str(round(float(value), 2))
    except (TypeError, ValueError):
        return "N/A"


def build_data_summary(df: pd.DataFrame) -> str:
    """Builds a text summary of the dataframe for the LLM to analyze."""
    summary = f"Dataset has {df.shape[0]} rows and {df.shape[1]} columns.\n\n"
    summary += "Column Details:\n"

    for col in df.columns:
        summary += f"\n- {col} ({str(df[col].dtype)})"
        if df[col].dtype in ['int64', 'float64', 'Int64', 'Float64']:
            summary += f"\n  Min: {_safe_stat(df[col].min())}, Max: {_safe_stat(df[col].max())}"
            summary += f"\n  Mean: {_safe_stat(df[col].mean())}"
            summary += f"\n  Sum: {_safe_stat(df[col].sum())}"
        else:
            summary += f"\n  Unique Values: {df[col].nunique()}"
            # Guard against all-null categorical columns (value_counts returns empty Series)
            value_counts = df[col].value_counts()
            if len(value_counts) > 0:
                summary += f"\n  Most Common: {value_counts.index[0]}"
            else:
                summary += "\n  Most Common: N/A (all values are null)"

    summary += f"\n\nFirst 5 rows:\n{df.head().to_string()}"
    return summary


def generate_insights(df: pd.DataFrame) -> list[str]:
    """
    Uses Groq LLM to generate 4-5 business insights from the dataset.
    Returns a list of insight strings. Uses the module-level _llm instance.
    """

    data_summary = build_data_summary(df)

    prompt = f"""You are a data analyst. Analyze this dataset and generate exactly 4 business insights.

Dataset Summary:
{data_summary}

Rules:
- Each insight must be a single clear sentence
- Include specific numbers and values from the data
- Focus on business value (revenue, trends, top performers, anomalies)
- Return ONLY a JSON array of 4 strings, nothing else
- Example format: ["Insight 1 here", "Insight 2 here", "Insight 3 here", "Insight 4 here"]

Generate the insights now:"""

    try:
        response = _llm.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        # Clean response if LLM adds markdown
        raw = raw.replace("```json", "").replace("```", "").strip()
        insights = json.loads(raw)

        if isinstance(insights, list):
            return insights[:5]  # Max 5 insights
        return ["Could not generate insights for this dataset."]

    except Exception as e:
        return [f"Insight generation error: {str(e)}"]