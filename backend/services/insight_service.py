import pandas as pd
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from config import GROQ_API_KEY
import json


def build_data_summary(df: pd.DataFrame) -> str:
    # Builds a text summary of the dataframe for the LLM to analyze
    summary = f"Dataset has {df.shape[0]} rows and {df.shape[1]} columns.\n\n"
    summary += "Column Details:\n"

    for col in df.columns:
        summary += f"\n- {col} ({str(df[col].dtype)})"
        if df[col].dtype in ['int64', 'float64']:
            summary += f"\n  Min: {df[col].min()}, Max: {df[col].max()}"
            summary += f"\n  Mean: {round(df[col].mean(), 2)}"
            summary += f"\n  Sum: {df[col].sum()}"
        else:
            summary += f"\n  Unique Values: {df[col].nunique()}"
            summary += f"\n  Most Common: {df[col].value_counts().index[0]}"

    summary += f"\n\nFirst 5 rows:\n{df.head().to_string()}"
    return summary


def generate_insights(df: pd.DataFrame) -> list[str]:
    """
    Uses Groq LLM to generate 4-5 business insights from the dataset.
    Returns a list of insight strings.
    """
    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile",
        temperature=0.3
    )

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
        response = llm.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        # Clean response if LLM adds markdown
        raw = raw.replace("```json", "").replace("```", "").strip()
        insights = json.loads(raw)

        if isinstance(insights, list):
            return insights[:5]  # Max 5 insights
        return ["Could not generate insights for this dataset."]

    except Exception as e:
        return [f"Insight generation error: {str(e)}"]