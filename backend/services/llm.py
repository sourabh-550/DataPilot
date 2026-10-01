"""
The one place that creates the LLM client and calls it.

Every caller gets the model from config (GROQ_MODEL), and every provider
failure — retired model, rate limit, outage, bad key — becomes an
LLMUnavailableError whose message is safe to show users. The raw provider
error only goes to the server log.
"""
from langchain_groq import ChatGroq
from config import GROQ_API_KEY, GROQ_MODEL, GROQ_REASONING_EFFORT

_BUSY_MESSAGE = "The AI service is busy right now. Please wait a few seconds and try again."
_UNAVAILABLE_MESSAGE = "The AI service is temporarily unavailable. Please try again in a minute."


class LLMUnavailableError(Exception):
    """The LLM call failed. str(error) is a clean, user-facing message."""


def get_llm(temperature: float = 0, json_mode: bool = False):
    """
    json_mode=True forces the reply to be a JSON object. Use it for every call
    whose output is parsed with json.loads: without it, gpt-oss on Groq sometimes
    emits its answer as a tool call and the request fails with 400
    tool_use_failed (measured: 9/15 failures without JSON mode, 0/15 with it).
    """
    model_kwargs = {}
    if GROQ_REASONING_EFFORT:
        # Sent as a raw request field — the pinned groq SDK predates this parameter.
        model_kwargs["extra_body"] = {"reasoning_effort": GROQ_REASONING_EFFORT}
    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name=GROQ_MODEL,
        temperature=temperature,
        model_kwargs=model_kwargs,
    )
    return llm.bind(response_format={"type": "json_object"}) if json_mode else llm


def _is_tool_use_failure(e: Exception) -> bool:
    return getattr(e, "status_code", None) == 400 and "tool_use_failed" in str(e)


def ask_llm(llm, messages) -> str:
    """Invoke the LLM and return its text, or raise LLMUnavailableError."""
    attempts = 2  # one retry, only for the transient gpt-oss tool_use_failed error
    for attempt in range(1, attempts + 1):
        try:
            response = llm.invoke(messages)
            break
        except Exception as e:
            if _is_tool_use_failure(e) and attempt < attempts:
                print(f"LLM tool_use_failed (model={GROQ_MODEL}), retrying once")
                continue
            print(f"LLM call failed (model={GROQ_MODEL}): {type(e).__name__}: {e}")
            is_rate_limit = getattr(e, "status_code", None) == 429
            raise LLMUnavailableError(_BUSY_MESSAGE if is_rate_limit else _UNAVAILABLE_MESSAGE) from e

    text = (response.content or "").strip()
    if not text:
        # Reasoning models can spend the whole budget thinking and return no answer.
        print(f"LLM returned an empty response (model={GROQ_MODEL})")
        raise LLMUnavailableError(_UNAVAILABLE_MESSAGE)
    return text
