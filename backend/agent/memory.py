from langchain.memory import ConversationBufferWindowMemory

_memory_store: dict = {}

def get_memory(session_id: str) -> ConversationBufferWindowMemory:
    if session_id not in _memory_store:
        _memory_store[session_id] = ConversationBufferWindowMemory(
            memory_key="chat_history",
            return_messages=False,  # Changed to False, saves tokens
            k=2                     
        )
    return _memory_store[session_id]

def clear_memory(session_id: str):
    if session_id in _memory_store:
        del _memory_store[session_id]