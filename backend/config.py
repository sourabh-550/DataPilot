from dotenv import load_dotenv
import os

load_dotenv()

# LLM Config
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Groq retires models regularly (llama-3.1-8b-instant was shut down Aug 2026),
# so the model is configuration, not code: swap it with a Render env var, no code change.
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
# For reasoning models (gpt-oss): low / medium / high. "low" keeps latency and
# token usage down. Set to an empty string when using a non-reasoning model.
GROQ_REASONING_EFFORT = os.getenv("GROQ_REASONING_EFFORT", "low")
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