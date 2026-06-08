import pandas as pd
import plotly.express as px
import plotly
import json
import traceback
from langchain.tools import StructuredTool

def create_chart_gen_tool(df: pd.DataFrame) -> StructuredTool:

    def chart_gen(chart_request: str) -> str:
        """Generate charts and visualizations from the dataframe."""
        try:
            parts = chart_request.split("|")
            if len(parts) < 3:
                return "Error: Use format 'chart_type|x_column|y_column|title'"

            chart_type = parts[0].strip().lower()
            x_col = parts[1].strip()
            y_col = parts[2].strip()
            title = parts[3].strip() if len(parts) > 3 else f"{y_col} by {x_col}"

            if x_col not in df.columns:
                return f"Error: Column '{x_col}' not found. Available: {list(df.columns)}"
            if chart_type != "histogram" and y_col not in df.columns:
                return f"Error: Column '{y_col}' not found. Available: {list(df.columns)}"

            if chart_type == "bar":
                fig = px.bar(df, x=x_col, y=y_col, title=title)
            elif chart_type == "line":
                fig = px.line(df, x=x_col, y=y_col, title=title)
            elif chart_type == "scatter":
                fig = px.scatter(df, x=x_col, y=y_col, title=title)
            elif chart_type == "pie":
                # For pie, group by x_col and count
                pie_data = df[x_col].value_counts().reset_index()
                pie_data.columns = [x_col, 'count']
                fig = px.pie(pie_data, names=x_col, values='count', title=title)
            elif chart_type == "histogram":
                fig = px.histogram(df, x=x_col, title=title)
            else:
                return f"Error: Unsupported chart type '{chart_type}'. Use: bar, line, scatter, pie, histogram"

            chart_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
            return f"CHART_JSON:{chart_json}"

        except Exception as e:
            return f"Chart generation error: {str(e)}\n{traceback.format_exc()}"

    return StructuredTool.from_function(
        func=chart_gen,
        name="chart_gen_tool",
        description="Use this tool to generate charts. Input format: 'chart_type|x_column|y_column|title'. Chart types: bar, line, scatter, pie, histogram. Example: 'bar|city|salary|Salary by City'"
    )