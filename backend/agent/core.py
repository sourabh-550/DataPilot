from langchain_groq import ChatGroq
from langchain.agents import AgentExecutor, create_react_agent
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.prompts import PromptTemplate
from agent.memory import get_memory
from config import GROQ_API_KEY
import pandas as pd

AGENT_PROMPT = """You are DataPilot, an expert AI data analyst assistant.
You help users analyze their datasets by answering questions,
running calculations, and generating visualizations.

You have access to the following tools:
{tools}

Always follow this process:
1. Understand what the user wants
2. Pick the right tool
3. Use the tool
4. Give a clear, friendly answer

Use this format:
Question: the input question
Thought: think about what to do
Action: tool name [{tool_names}]
Action Input: input for the tool
Observation: tool result
... (repeat if needed)
Thought: I have the answer
Final Answer: your response to the user

Previous conversation:
{chat_history}

Question: {input}
Thought: {agent_scratchpad}"""


def create_agent(df: pd.DataFrame, session_id: str) -> AgentExecutor:
    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile",
        temperature=0
    )

    from agent.tools import (
        create_data_info_tool,
        create_python_exec_tool,
        create_chart_gen_tool
    )

    tools = [
        create_data_info_tool(df),
        create_python_exec_tool(df),
        create_chart_gen_tool(df)
    ]

    prompt = PromptTemplate.from_template(AGENT_PROMPT)
    memory = get_memory(session_id)

    agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)

    return AgentExecutor(
        agent=agent,
        tools=tools,
        memory=memory,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=5
    )