from langchain_core.messages import HumanMessage, SystemMessage
from agent.tools.python_exec import create_python_exec_tool
from agent.tools.data_info import create_data_info_tool
from agent.tools.chart_gen import create_chart_gen_tool
from services.llm import get_llm, ask_llm, LLMUnavailableError
import pandas as pd
import json
import re

_COULD_NOT_ANSWER = "Sorry, I couldn't work out how to answer that. Try rephrasing your question."


def _answer_text(raw: str) -> str:
    """Pull the sentence out of the explainer's {"answer": ...} JSON reply."""
    try:
        answer = json.loads(raw).get("answer")
    except (ValueError, AttributeError):
        answer = None
    text = answer if isinstance(answer, str) and answer.strip() else raw
    # The model sometimes emits **bold** despite "no markdown"; the chat UI shows raw asterisks.
    return re.sub(r"\*\*(.+?)\*\*", r"\1", text).strip()

def create_agent(df: pd.DataFrame, session_id: str):
    return SimpleDataAgent(df, session_id)


class SimpleDataAgent:
    def __init__(self, df: pd.DataFrame, session_id: str):
        self.df = df
        self.session_id = session_id
        # JSON mode for both calls (the action decision and the explanation): in plain-text
        # mode gpt-oss sometimes answers with a tool call and Groq rejects it (tool_use_failed).
        self.llm = get_llm(temperature=0, json_mode=True)
        self.data_info = create_data_info_tool(df)
        self.python_exec = create_python_exec_tool(df)
        self.chart_gen = create_chart_gen_tool(df)

    def invoke(self, inputs: dict) -> dict:
        question = inputs["input"]

        # Step 1 — get dataset info
        df_info = self.data_info.func("get info")

        # Step 2 — decide what to do
        system = f"""You are DataPilot, an AI data analyst.
Dataset info:
{df_info}

Respond ONLY with a JSON object in this exact format:
{{"action": "chart", "params": "bar|product|price|Price by Product"}}
or
{{"action": "code", "params": "result = df['price'].sum()"}}
or
{{"action": "answer", "params": "your direct answer here"}}

Rules:
- Use "chart" when user wants visualization/chart/graph/plot
- Use "code" for ANY question whose answer depends on the data values: totals, averages, counts, rankings, comparisons, "which/who has the highest", filters, trends
- Use "answer" ONLY for questions about the dataset's structure (column names, types, what a column means) — never compute or guess numbers in an answer
- Never add currency symbols ($, ₹, €, £) or currency names unless a column name or the data itself shows that currency
- For chart params format: chart_type|x_column|y_column|title
- chart_type must be exactly one of: bar, line, scatter, pie, histogram
- For histogram and pie, leave y_column empty, e.g. "histogram|price||Price Distribution"
- For code params: valid pandas code, store output in 'result' variable
- Additive measures (sales, revenue, amount, quantity, units, orders, profit): for "top/most/best/maximum/highest/lowest X" questions, FIRST aggregate per X with groupby + sum, THEN rank. Example: totals = df.groupby('product')['quantity'].sum(); result = {{"product": totals.idxmax(), "measure": "total quantity", "value": totals.max()}}
- Never report one row's value as a total. Pick a single row only when the question asks about one order/row/record, or compares a per-item attribute — and include its label: result = df.loc[df['total_sales'].idxmax(), ['product', 'total_sales']].to_dict()
- Per-item attributes (price, unit price, rating, age, cost per unit) are NEVER summed: compare individual rows, or use mean when grouping. Example: result = df.loc[df['price'].idxmin(), ['product', 'price']].to_dict()
- Round decimal numbers in result to 2 places
- "Selling" / "best selling" with no measure stated means units sold: use the quantity/units column if one exists, otherwise the sales/revenue column. Always put the measure's name in result
- For "which/who" questions, result must include the label AND the value
- In code: df and pd are already loaded; do not import anything, read or write files, or use df.query/eval (use boolean masks instead)
- Return ONLY the JSON, nothing else"""

        # Step 3 — parse and execute
        try:
            raw = ask_llm(self.llm, [
                SystemMessage(content=system),
                HumanMessage(content=question)
            ])
            raw = raw.replace("```json", "").replace("```", "").strip()
            decision = json.loads(raw)
            action = decision.get("action")
            params = decision.get("params")

            if action == "chart":
                result = self.chart_gen.func(params)
                if "CHART_JSON:" in result:
                    return {"output": f"CHART_JSON:{result.split('CHART_JSON:')[1]}"}
                return {"output": result}

            elif action == "code":
                result = self.python_exec.func(params)
                # Ask LLM to explain the result
                # The explainer sees the code too, so it can say exactly what was computed.
                explain = ask_llm(self.llm, [
                    HumanMessage(content=(
                        f"Question: {question}\n"
                        f"Code that was run:\n{params}\n"
                        f"Code result: {result}\n\n"
                        "Answer in 1-2 friendly sentences. "
                        "Mention every label in the code result (e.g. the product or region name) together with its number. "
                        "Say exactly what was measured, reading it from the code: groupby + sum means a total "
                        "across all rows in each group; mean means an average; a single row picked with "
                        "idxmax/idxmin/loc means one order or one item — never call a single row a total. "
                        "Only state facts present in the code result — never invent names, labels or totals. "
                        "Do not add currency symbols or currency names unless a column name or the result shows one. "
                        "No code, no markdown.\n"
                        'Reply ONLY with JSON: {"answer": "<your sentences>"}'
                    ))
                ])
                return {"output": _answer_text(explain)}

            else:
                return {"output": params}

        except LLMUnavailableError as e:
            return {"output": str(e)}
        except Exception as e:
            # e.g. the model returned malformed JSON — log it, keep the user message clean
            print(f"Agent failed to process question: {type(e).__name__}: {e}")
            return {"output": _COULD_NOT_ANSWER}