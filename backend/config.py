from dotenv import load_dotenv
import os

load_dotenv()

# LLM Config
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DEFAULT_LLM = "groq"   # Options: "groq" or "gemini"

# File upload config
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"]
MAX_FILE_SIZE_MB = 10

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./datapilot.db")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")  # e.g. https://haqyndcjvfhxkdmclbue.supabase.co
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "datapilot-uploads")

# Session config
SESSION_EXPIRY_HOURS = 24