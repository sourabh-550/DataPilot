import pandas as pd
import traceback
from langchain.tools import StructuredTool

# Patterns that indicate sandbox escape attempts or dangerous operations.
# This is a defense-in-depth layer on top of the restricted builtins.
_BLOCKED_PATTERNS = [
    "__class__", "__subclasses__", "__mro__", "__bases__", "__globals__",
    "__builtins__", "__import__", "__reduce__",
    "import os", "import sys", "import subprocess",
    "open(", "exec(", "eval(",
    "subprocess", "socket", "shutil", "pathlib",
]

_MAX_CODE_LENGTH = 2000  # Characters — generous for any legitimate pandas operation


def create_python_exec_tool(df: pd.DataFrame) -> StructuredTool:

    def python_exec(code: str) -> str:
        """Execute Python and Pandas code on the dataframe to analyze data."""

        # --- Input guards ---
        if len(code) > _MAX_CODE_LENGTH:
            return (
                f"Code execution refused: code is too long "
                f"({len(code)} chars, max {_MAX_CODE_LENGTH})."
            )

        code_lower = code.lower()
        for pattern in _BLOCKED_PATTERNS:
            if pattern.lower() in code_lower:
                return f"Code execution refused: blocked pattern '{pattern}' detected."

        # --- Execute in a restricted environment ---
        try:
            local_vars = {"df": df.copy(), "pd": pd}
            exec(code, {"__builtins__": {}}, local_vars)  # noqa: S102
            if "result" in local_vars:
                # Convert to string safely; avoid leaking complex objects
                result = local_vars["result"]
                return str(result)[:5000]  # Limit output size
            return (
                "Code executed successfully but no 'result' variable found. "
                "Use `result = ...` to store your output."
            )
        except Exception as e:
            return f"Code execution error: {str(e)}\n{traceback.format_exc()}"

    return StructuredTool.from_function(
        func=python_exec,
        name="python_exec_tool",
        description=(
            "Use this tool to analyze data by executing Python/Pandas code. "
            "The dataframe is already loaded as variable 'df'. "
            "Always store output in a variable called 'result'. "
            "Example: result = df['sales'].sum()"
        ),
    )