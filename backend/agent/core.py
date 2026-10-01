from langchain_core.messages import HumanMessage, SystemMessage
from agent.tools.python_exec import create_python_exec_tool
from agent.tools.data_info import create_data_info_tool
from agent.tools.chart_gen import create_chart_gen_tool
from services.llm import get_llm, ask_llm, LLMUnavailableError
import pandas as pd
import json

_COULD_NOT_ANSWER = "Sorry, I couldn't work out how to answer that. Try rephrasing your question."

def create_agent(df: pd.DataFrame, session_id: str):
    return SimpleDataAgent(df, session_id)


class SimpleDataAgent:
    def __init__(self, df: pd.DataFrame, session_id: str):
        self.df = df
        self.session_id = session_id
        self.llm = get_llm(temperature=0)                          # plain-text explanations
        self.decision_llm = get_llm(temperature=0, json_mode=True)  # the {"action", "params"} decision
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
- For chart params format: chart_type|x_column|y_column|title
- chart_type must be exactly one of: bar, line, scatter, pie, histogram
- For histogram and pie, leave y_column empty, e.g. "histogram|price||Price Distribution"
- For code params: valid pandas code, store output in 'result' variable
- For "which/who has the highest/lowest" questions, result must include the label AND the value, e.g. result = df.loc[df['price'].idxmin(), ['product', 'price']].to_dict()
- In code: df and pd are already loaded; do not import anything, read or write files, or use df.query/eval (use boolean masks instead)
- Return ONLY the JSON, nothing else"""

        # Step 3 — parse and execute
        try:
            raw = ask_llm(self.decision_llm, [
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
                explain = ask_llm(self.llm, [
                    HumanMessage(content=f"Question: {question}\nCode result: {result}\nGive a brief 1-2 sentence friendly answer with just the key numbers. Only state facts present in the code result — never invent names or labels. No code, no markdown.")
                ])
                return {"output": explain}

            else:
                return {"output": params}

        except LLMUnavailableError as e:
            return {"output": str(e)}
        except Exception as e:
            # e.g. the model returned malformed JSON — log it, keep the user message clean
            print(f"Agent failed to process question: {type(e).__name__}: {e}")
            return {"output": _COULD_NOT_ANSWER}