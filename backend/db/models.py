from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from db.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True)        # UUID
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)    # csv/excel — V2: sql/pdf
    row_count = Column(Integer)
    col_count = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime)                 # V2: auto cleanup


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    role = Column(String, nullable=False)         # user / assistant
    message = Column(Text, nullable=False)
    tool_used = Column(String, nullable=True)     # which agent tool fired
    created_at = Column(DateTime, server_default=func.now())
