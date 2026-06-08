from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from agent.tools.python_exec import create_python_exec_tool
from agent.tools.data_info import create_data_info_tool
from agent.tools.chart_gen import create_chart_gen_tool
from config import GROQ_API_KEY
import pandas as pd
import json

def create_agent(df: pd.DataFrame, session_id: str):
    return SimpleDataAgent(df, session_id)


class SimpleDataAgent:
    def __init__(self, df: pd.DataFrame, session_id: str):
        self.df = df
        self.session_id = session_id
        self.llm = ChatGroq(
            groq_api_key=GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",
            temperature=0
        )
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
- Use "code" when user wants calculations/statistics/analysis
- Use "answer" for simple questions about the data
- For chart params format: chart_type|x_column|y_column|title
- For code params: valid pandas code, store output in 'result' variable
- Return ONLY the JSON, nothing else"""

        response = self.llm.invoke([
            SystemMessage(content=system),
            HumanMessage(content=question)
        ])

        # Step 3 — parse and execute
        try:
            raw = response.content.strip()
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
                explain = self.llm.invoke([
                    HumanMessage(content=f"Question: {question}\nCode result: {result}\nGive a brief friendly explanation.")
                ])
                return {"output": explain.content}

            else:
                return {"output": params}

        except Exception as e:
            return {"output": f"Sorry, I could not process that. Error: {str(e)}"}