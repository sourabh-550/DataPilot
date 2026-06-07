import pandas as pd
import traceback
from langchain.tools import StructuredTool

def create_python_exec_tool(df: pd.DataFrame) -> StructuredTool:

    def python_exec(code: str) -> str:
        """Execute Python and Pandas code on the dataframe to analyze data."""
        try:
            local_vars = {"df": df.copy(), "pd": pd}
            exec(code, {"__builtins__": {}}, local_vars)
            if "result" in local_vars:
                return str(local_vars["result"])
            return "Code executed successfully but no result variable found. Use result = ... to store output."
        except Exception as e:
            return f"Code execution error: {str(e)}\n{traceback.format_exc()}"

    return StructuredTool.from_function(
        func=python_exec,
        name="python_exec_tool",
        description="Use this tool to analyze data by executing Python/Pandas code. The dataframe is already loaded as variable 'df'. Always store output in a variable called 'result'. Example: result = df['sales'].sum()"
    )