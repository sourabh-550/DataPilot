import ast
import builtins
import gc
import multiprocessing as mp
import numbers
import os
import re
import sys
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
_NO_RESULT_MESSAGE = (
    "Code executed successfully but no 'result' variable found. "
    "Use `result = ...` to store your output."
)

# ── Runtime isolation ─────────────────────────────────────────────────────────
# Generated code runs in a short-lived child process, which gives us:
#   * a hard time limit — the child is killed if it overruns, even inside a
#     C-level loop that a signal or trace-based timeout could not interrupt
#   * no secrets — the child clears its environment before running anything
#   * an audit hook (PEP 578) that only ever exists in the child, so the web
#     server process itself is never affected by it
_TIME_LIMIT_SECONDS = 10

# fork (Linux / Render) is copy-on-write and starts in milliseconds. spawn is the
# fallback for Windows dev; it re-imports pandas first, so it gets extra startup time.
if "fork" in mp.get_all_start_methods():
    _MP_CONTEXT, _STARTUP_ALLOWANCE = mp.get_context("fork"), 0
else:
    _MP_CONTEXT, _STARTUP_ALLOWANCE = mp.get_context("spawn"), 15

# Reads are allowed only inside the Python installation / virtualenv (stdlib and
# site-packages, needed if pandas lazily imports a module). Project files, .env,
# /proc and /etc are all outside these roots.
_READ_ROOTS = tuple(sorted({
    os.path.join(os.path.abspath(p), "")
    for p in (sys.prefix, sys.base_prefix, sys.exec_prefix, sys.base_exec_prefix)
}))

# Audit events refused while generated code runs: network, processes, filesystem
# changes, directory listings, native code, and frame inspection.
_DENIED_AUDIT_EVENTS = (
    "socket.", "urllib.", "http.", "ftplib.", "smtplib.", "webbrowser.",
    "subprocess.", "os.system", "os.exec", "os.spawn", "os.posix_spawn",
    "os.fork", "os.forkpty", "os.kill", "os.killpg", "os.startfile",
    "os.remove", "os.unlink", "os.rename", "os.rmdir", "os.mkdir", "os.chmod",
    "os.chown", "os.link", "os.symlink", "os.truncate", "os.utime",
    "os.putenv", "os.unsetenv", "os.chdir", "os.listdir", "os.scandir",
    "glob.", "shutil.", "ctypes.", "sys._getframe", "sys.settrace",
    "sys.setprofile", "sys.addaudithook",
)
_WRITE_FLAGS = os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_APPEND | os.O_TRUNC


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


def _is_number(x) -> bool:
    return isinstance(x, numbers.Number) and not isinstance(x, bool)


# Calendar labels pandas won't parse on their own: "February", "Mar 2025", "Mon", "Q3", "2025 Q1".
# Whole words only, so a category like "Mayonnaise" isn't mistaken for "May".
_CALENDAR_LABEL = re.compile(
    r"^(?:(?:january|february|march|april|may|june|july|august|september|october|november|december"
    r"|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\.?(?:\s+\d{2,4})?"
    r"|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun"
    r"|q[1-4](?:\s*\d{2,4})?|\d{4}\s*-?\s*q[1-4])$",
    re.IGNORECASE,
)


def _is_ordered_axis(labels) -> bool:
    """True for labels with a natural order — years, IDs, dates, months, weekdays,
    quarters — which must keep that order (sorting a trend by value would scramble it)."""
    labels = list(labels)
    if not labels or all(_is_number(l) for l in labels):
        return True
    if any(isinstance(l, (pd.Timestamp, pd.Period)) or hasattr(l, "isoformat") for l in labels):
        return True
    text = [str(l).strip() for l in labels]
    if sum(bool(_CALENDAR_LABEL.match(t)) for t in text) / len(text) > 0.8:
        return True
    parsed = pd.to_datetime(pd.Series(text), errors="coerce", format="mixed")
    return parsed.notna().mean() > 0.8


def _order_by_value(value):
    """
    A value per category (e.g. average order value per region) reads largest
    first, so the explanation can name the top one. Time-ordered results and
    mixed records like {"product": "Mouse", "price": 25} are left as they are.
    """
    if isinstance(value, pd.Series):
        if (len(value) > 1 and not isinstance(value.index, pd.MultiIndex)
                and pd.api.types.is_numeric_dtype(value) and not _is_ordered_axis(value.index)):
            return value.sort_values(ascending=False)
        return value
    if isinstance(value, pd.DataFrame):
        numeric = value.select_dtypes("number").columns
        others = [c for c in value.columns if c not in numeric]
        if len(value) > 1 and len(numeric) == 1 and len(others) <= 1:
            labels = value[others[0]] if others else value.index
            if not _is_ordered_axis(labels):
                return value.sort_values(numeric[0], ascending=False)
        return value
    if isinstance(value, dict) and len(value) > 1 and all(_is_number(v) for v in value.values()):
        if not _is_ordered_axis(value.keys()):
            return dict(sorted(value.items(), key=lambda kv: kv[1], reverse=True))
    return value


def _round_floats(value):
    """Round floats to 2 places so answers say 676.67, not 676.6666666666666."""
    if isinstance(value, (pd.DataFrame, pd.Series)):
        try:
            return value.round(2)
        except TypeError:  # non-numeric Series
            return value
    if isinstance(value, float):  # includes numpy float64
        return round(value, 2)
    if isinstance(value, dict):
        return {k: _round_floats(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return type(value)(_round_floats(v) for v in value)
    if hasattr(value, "dtype") and getattr(value.dtype, "kind", "") == "f":  # numpy float32 etc.
        return round(float(value), 2)
    return value


def _install_audit_hook(state: dict):
    """Refuse dangerous operations while state['active'] is True (child process only)."""

    def hook(event, args):
        if not state["active"]:
            return
        if event == "open":
            path, mode, flags = args
            if isinstance(path, int):
                raise PermissionError("sandbox: opening file descriptors is not allowed")
            full_path = os.path.abspath(os.fsdecode(os.fspath(path)))
            writing = bool(mode and any(c in mode for c in "wax+")) or bool(flags & _WRITE_FLAGS)
            if writing or not full_path.startswith(_READ_ROOTS):
                raise PermissionError("sandbox: file access is not allowed")
        elif event.startswith(_DENIED_AUDIT_EVENTS):
            raise PermissionError(f"sandbox: '{event}' is not allowed")

    sys.addaudithook(hook)


def _run_in_child(code: str, df: pd.DataFrame, conn):
    """Child-process entry point: strip secrets, arm the audit hook, run, report back."""
    # A forked child shares the server's open DB/HTTP sockets; never let garbage
    # collection run their finalizers here. The child lives for seconds at most.
    gc.disable()
    os.environ.clear()  # API keys and DB URLs are never needed by generated code

    state = {"active": False}
    _install_audit_hook(state)

    # One namespace for globals AND locals: with separate dicts, lambdas and
    # comprehensions can't see variables the code defined earlier.
    namespace = {"__builtins__": _SAFE_BUILTINS, "df": df, "pd": pd}
    try:
        state["active"] = True
        exec(code, namespace)  # noqa: S102
        # str() runs while still guarded — result objects can have custom __str__.
        if "result" in namespace:
            output = str(_round_floats(_order_by_value(namespace["result"])))[:_MAX_OUTPUT_CHARS]
        else:
            output = _NO_RESULT_MESSAGE
    except Exception as e:
        # Type + message only — a full traceback would leak server file paths.
        output = f"Code execution error: {type(e).__name__}: {e}"
    finally:
        state["active"] = False

    conn.send(output)
    conn.close()


def _execute_isolated(code: str, df: pd.DataFrame) -> str:
    """Run code in a child process; kill it if it exceeds the time limit."""
    reader, writer = _MP_CONTEXT.Pipe(duplex=False)
    proc = _MP_CONTEXT.Process(target=_run_in_child, args=(code, df, writer), daemon=True)
    proc.start()
    writer.close()  # keep only the child's copy, so we get EOF if the child dies
    try:
        if reader.poll(_TIME_LIMIT_SECONDS + _STARTUP_ALLOWANCE):
            return reader.recv()
        return (
            f"Code execution refused: time limit of {_TIME_LIMIT_SECONDS}s exceeded. "
            "Use vectorized pandas operations instead of loops."
        )
    except EOFError:
        return "Code execution error: the analysis process stopped unexpectedly (out of memory?)."
    finally:
        reader.close()
        if proc.is_alive():
            proc.kill()
        proc.join(timeout=5)


def create_python_exec_tool(df: pd.DataFrame) -> StructuredTool:

    def python_exec(code: str) -> str:
        """Execute Python and Pandas code on the dataframe to analyze data."""

        # --- Input guards ---
        if len(code) > _MAX_CODE_LENGTH:
            return (
                f"Code execution refused: code is too long "
                f"({len(code)} chars, max {_MAX_CODE_LENGTH})."
            )

        # Layer 1 — static check (fast, clear error messages for the LLM)
        reason = _check_code(code)
        if reason:
            return f"Code execution refused: {reason}."

        # Layer 2 — isolated child process with an audit hook and a time limit.
        # The child gets its own copy of df, so the original is never modified.
        return _execute_isolated(code, df)

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
