from dotenv import load_dotenv
import os

load_dotenv()

#LLM Config

GROQ_API_KEY=os.getenv("GROQ_API_KEY")
GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")
DEFAULT_LLM="groq"   #Options: "groq" or "gemini"

#File upload config
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"]
MAX_FILE_SIZE_MB = 10

DATABASE_URL="sqlite+aiosqlite:///./datapilot.db"

#Session config
SESSION_EXPIRY_HOURS=24