import re
import pandas as pd
import plotly.express as px
import plotly
import json
import traceback
from langchain.tools import StructuredTool

# Charts that summarise a value per category. When the x column repeats (one row
# per order), plotting raw rows draws one stacked slice per order and the hover
# shows a single order's value — so these are aggregated to one value per x first.
_AGGREGATED_TYPES = {"bar", "line", "pie"}
_AGGREGATIONS = {"sum", "mean"}


def readable(col: str) -> str:
    """total_amount → 'Total amount' (axis labels and hover text)."""
    text = re.sub(r"[_\-]+", " ", str(col)).strip()
    return text[:1].upper() + text[1:]


def _lower_first(text: str) -> str:
    return text[:1].lower() + text[1:]


def value_label(y_col: str, agg: str) -> str:
    """Label for an aggregated value: 'Total amount', 'Total quantity', 'Average price'."""
    base = readable(y_col)
    if agg == "mean":
        return f"Average {_lower_first(base)}"
    if base.lower().startswith(("total", "sum")):
        return base
    return f"Total {_lower_first(base)}"


def _number_format(values: pd.Series) -> str:
    """Thousands separators; decimals only when the values have them."""
    is_whole = (values.dropna() % 1 == 0).all()
    return ",.0f" if is_whole else ",.2f"


def _order_line_x(agg_df: pd.DataFrame, x_col: str) -> pd.DataFrame:
    """Line charts read left to right: sort dates chronologically, anything else by x."""
    dates = pd.to_datetime(agg_df[x_col], errors="coerce", format="mixed")
    if dates.notna().mean() > 0.9:
        return agg_df.assign(_sort=dates).sort_values("_sort").drop(columns="_sort")
    return agg_df.sort_values(x_col)


def create_chart_gen_tool(df: pd.DataFrame) -> StructuredTool:

    def chart_gen(chart_request: str, agg: str = "sum") -> str:
        """
        Generate a chart. chart_request: 'chart_type|x_column|y_column|title[|agg]'.
        agg ('sum' or 'mean') decides how repeated x values are combined; an agg
        field in the request overrides the argument.
        """
        try:
            parts = chart_request.split("|")
            if len(parts) < 3:
                return "Error: Use format 'chart_type|x_column|y_column|title'"

            chart_type = parts[0].strip().lower()
            chart_type = {"hist": "histogram"}.get(chart_type, chart_type)  # common LLM shorthand
            x_col = parts[1].strip()
            y_col = parts[2].strip()
            if len(parts) > 4 and parts[4].strip().lower() in _AGGREGATIONS:
                agg = parts[4].strip().lower()
            agg = agg if agg in _AGGREGATIONS else "sum"

            if x_col not in df.columns:
                return f"Error: Column '{x_col}' not found. Available: {list(df.columns)}"
            # histogram uses only x; pie without y counts rows per category
            if chart_type not in ("histogram", "pie") and y_col not in df.columns:
                return f"Error: Column '{y_col}' not found. Available: {list(df.columns)}"
            if y_col and y_col in df.columns and chart_type in _AGGREGATED_TYPES \
                    and not pd.api.types.is_numeric_dtype(df[y_col]):
                return f"Error: Column '{y_col}' isn't numeric, so it can't be totalled. Pick a numeric column."

            x_label = readable(x_col)
            title = parts[3].strip() if len(parts) > 3 and parts[3].strip() else None

            if chart_type == "pie":
                if y_col in df.columns:
                    values = df.groupby(x_col, dropna=False)[y_col].agg(agg)
                    v_label = value_label(y_col, agg)
                else:
                    values = df[x_col].value_counts(dropna=False)
                    v_label = "Count"
                pie_df = values.sort_values(ascending=False).reset_index(name="value")
                fig = px.pie(pie_df, names=x_col, values="value", title=title or f"{v_label} by {_lower_first(x_label)}")
                fig.update_traces(
                    hovertemplate=f"%{{label}}<br>{v_label}: %{{value:{_number_format(pie_df['value'])}}} (%{{percent}})<extra></extra>",
                    sort=False,
                )

            elif chart_type in ("bar", "line"):
                if df[x_col].duplicated().any():
                    # One value per category: sum by default, mean for "average" questions.
                    plot_df = df.groupby(x_col, dropna=False)[y_col].agg(agg).reset_index()
                    y_label = value_label(y_col, agg)
                else:
                    plot_df = df[[x_col, y_col]].copy()
                    y_label = readable(y_col)

                if chart_type == "bar":
                    plot_df = plot_df.sort_values(y_col, ascending=False)
                    fig = px.bar(plot_df, x=x_col, y=y_col, title=title or f"{y_label} by {_lower_first(x_label)}")
                else:
                    plot_df = _order_line_x(plot_df, x_col)
                    fig = px.line(plot_df, x=x_col, y=y_col, title=title or f"{y_label} by {_lower_first(x_label)}", markers=True)

                fmt = _number_format(plot_df[y_col])
                fig.update_traces(hovertemplate=f"%{{x}}<br>{y_label}: %{{y:{fmt}}}<extra></extra>")
                fig.update_layout(xaxis_title=x_label, yaxis_title=y_label, yaxis_tickformat=",")
                if chart_type == "bar":
                    fig.update_xaxes(type="category")  # keep the value order, even for numeric-looking x

            elif chart_type == "scatter":
                fig = px.scatter(df, x=x_col, y=y_col, title=title or f"{readable(y_col)} vs {_lower_first(x_label)}")
                fig.update_layout(xaxis_title=x_label, yaxis_title=readable(y_col))

            elif chart_type == "histogram":
                fig = px.histogram(df, x=x_col, title=title or f"Distribution of {_lower_first(x_label)}")
                fig.update_layout(xaxis_title=x_label, yaxis_title="Count")

            else:
                return f"Error: Unsupported chart type '{chart_type}'. Use: bar, line, scatter, pie, histogram"

            chart_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
            return f"CHART_JSON:{chart_json}"

        except Exception as e:
            # Log the traceback server-side; the user-facing text must not leak file paths.
            print(f"Chart generation failed: {traceback.format_exc()}")
            return f"Sorry, I couldn't build that chart ({type(e).__name__}). Try different columns or a different chart type."

    return StructuredTool.from_function(
        func=chart_gen,
        name="chart_gen_tool",
        description="Use this tool to generate charts. Input format: 'chart_type|x_column|y_column|title'. Chart types: bar, line, scatter, pie, histogram. Example: 'bar|city|salary|Salary by City'"
    )
