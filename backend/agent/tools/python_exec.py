import ast
import builtins
import re
import pandas as pd
from langchain.tools import StructuredTool

# LLM-generated code runs with ONLY these builtins. Everything that can reach the
# filesystem, network or interpreter internals (open, eval, exec, getattr, vars,
# __import__, type, ...) is simply absent, so calling it raises NameError.
_SAFE_BUILTINS = {
    name: getattr(builtins, name)
    for name in (
        "abs", "all", "any", "bool", "dict", "enumerate", "filter", "float",
        "int", "isinstance", "len", "list", "map", "max", "min", "range",
        "reversed", "round", "set", "sorted", "str", "sum", "tuple", "zip",
    )
}

# `pd.<name>` is limited to the analysis API. This keeps out pd.read_* and
# internals like pd.io / pd.core, which expose raw file handles.
_PD_ALLOWED = {
    "DataFrame", "Series", "Index", "MultiIndex", "Categorical", "Grouper", "NamedAgg",
    "Timestamp", "Timedelta", "DateOffset", "offsets", "NA", "NaT",
    "concat", "merge", "crosstab", "pivot_table", "melt", "cut", "qcut", "get_dummies",
    "to_datetime", "to_numeric", "to_timedelta", "date_range",
    "isna", "isnull", "notna", "notnull", "unique",
}

# Attribute / method names refused anywhere in the code:
#   read_*                 — every pandas reader (files, URLs, pickle)
#   to_<format>            — every pandas writer that takes a path
#   tofile, dump           — numpy arrays (df.values) writing to disk
#   query, eval            — pandas' own expression evaluators
#   format, format_map     — str.format templates can walk attributes at runtime
#   gi_/cr_/ag_/f_/tb_/co_ — generator, frame and code objects lead to module globals
_BLOCKED_NAME = re.compile(
    r"read_\w*"
    r"|to_(csv|excel|pickle|parquet|feather|hdf|sql|json|html|xml|latex|stata|orc|clipboard|markdown|gbq)"
    r"|tofile|dump|query|eval|format|format_map"
    r"|(gi|cr|ag|f|tb|co)_\w+"
)

_MAX_CODE_LENGTH = 2000  # Characters — generous for any legitimate pandas operation
_MAX_OUTPUT_CHARS = 5000


def _check_code(code: str):
    """
    Static safety check on the parsed code (AST), not on raw text, so spacing or
    aliasing tricks don't slip past it. Returns the reason the code is refused,
    or None if it may run.

    This is defense in depth, not a true sandbox: Python can't be fully sandboxed
    in-process. Real isolation would run the code in a separate process with no
    secrets in its environment.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return f"syntax error on line {e.lineno}: {e.msg}"

    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            return "imports are not allowed — df and pd are already available"

        if isinstance(node, ast.Attribute):
            name = node.attr
        elif isinstance(node, ast.Name):
            name = node.id
        else:
            name = None

        if name is not None:
            if name.startswith("_"):
                return f"access to '{name}' is not allowed"
            if _BLOCKED_NAME.fullmatch(name):
                return f"'{name}' is not allowed (no file, network or eval access)"

        # pd.<attr> must be part of the analysis API
        if (isinstance(node, ast.Attribute) and isinstance(node.value, ast.Name)
                and node.value.id == "pd" and node.attr not in _PD_ALLOWED):
            return f"'pd.{node.attr}' is not allowed"

        # Methods like df.agg("to_csv", path) dispatch on a string name.
        if (isinstance(node, ast.Constant) and isinstance(node.value, str)
                and _BLOCKED_NAME.fullmatch(node.value.strip())):
            return f"'{node.value}' is not allowed (no file, network or eval access)"

        # to_string() is fine for display, but to_string(buf) writes to a path.
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                and node.func.attr == "to_string"
                and (node.args or any(k.arg == "buf" for k in node.keywords))):
            return "to_string() may not write to a file — call it without 'buf'"

    return None


def create_python_exec_tool(df: pd.DataFrame) -> StructuredTool:

    def python_exec(code: str) -> str:
        """Execute Python and Pandas code on the dataframe to analyze data."""

        # --- Input guards ---
        if len(code) > _MAX_CODE_LENGTH:
            return (
                f"Code execution refused: code is too long "
                f"({len(code)} chars, max {_MAX_CODE_LENGTH})."
            )

        reason = _check_code(code)
        if reason:
            return f"Code execution refused: {reason}."

        # --- Execute in a restricted environment ---
        # One namespace for globals AND locals: with separate dicts, lambdas and
        # comprehensions can't see variables the code defined earlier.
        namespace = {"__builtins__": _SAFE_BUILTINS, "df": df.copy(), "pd": pd}
        try:
            exec(code, namespace)  # noqa: S102
        except Exception as e:
            # Type + message only — a full traceback would leak server file paths.
            return f"Code execution error: {type(e).__name__}: {e}"

        if "result" in namespace:
            return str(namespace["result"])[:_MAX_OUTPUT_CHARS]
        return (
            "Code executed successfully but no 'result' variable found. "
            "Use `result = ...` to store your output."
        )

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
