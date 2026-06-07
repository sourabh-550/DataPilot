from langchain.memory import ConversationBufferWindowMemory

# Store memory per session
_memory_store: dict = {}

def get_memory(session_id: str) -> ConversationBufferWindowMemory:
    """
    Returns existing memory for a session or creates new one.
    k=10 means agent remembers last 10 exchanges.
    """
    if session_id not in _memory_store:
        _memory_store[session_id] = ConversationBufferWindowMemory(
            memory_key="chat_history",
            return_messages=True,
            k=10
        )
    return _memory_store[session_id]


def clear_memory(session_id: str):
    """Call this when session expires — V2 auto cleanup"""
    if session_id in _memory_store:
        del _memory_store[session_id]