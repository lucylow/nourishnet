import os

# FLock API
FLOCK_API_KEY = os.getenv("FLOCK_API_KEY", "your-flock-key")
FLOCK_API_URL = os.getenv(
    "FLOCK_API_URL", "https://api.flock.io/v1/chat/completions"
)

# Convenience mapping of which model each agent should use.
FLOCK_MODELS = {
    "scout": "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "coordinator": "mistralai/Mistral-7B-Instruct-v0.3",
    "logistics": "google/gemma-2b-it",
}

# Use mock FLock client instead of real API (for local dev / demos).
USE_MOCK_FLOCK = os.getenv("USE_MOCK_FLOCK", "false").lower() == "true"

# Groq LLM (optional, for low‑latency inference)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_DEFAULT_MODEL = os.getenv("GROQ_DEFAULT_MODEL", "llama-3.1-8b-instant")

# MCP server settings
MCP_HOST = os.getenv("MCP_HOST", "127.0.0.1")
MCP_PORT = int(os.getenv("MCP_PORT", "8000"))  # main event bus port

# Agent ports (reserved for future per-agent MCP/tool servers)
SCOUT_PORT = int(os.getenv("SCOUT_PORT", "8001"))
COORDINATOR_PORT = int(os.getenv("COORDINATOR_PORT", "8002"))
LOGISTICS_PORT = int(os.getenv("LOGISTICS_PORT", "8003"))

# Redis (optional) – for shared state
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Twilio / Telegram credentials (mock for demo)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "mock")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "mock")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "+14155238886")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "mock")

# Optional Telegram webhook URL and mock flag
TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL", "")
USE_MOCK_TELEGRAM = os.getenv("USE_MOCK_TELEGRAM", "false").lower() == "true"

# Enable mock WhatsApp mode even when Twilio is configured
USE_MOCK_WHATSAPP = os.getenv("USE_MOCK_WHATSAPP", "false").lower() == "true"

# Human supervisor dashboard
SUPERVISOR_URL = os.getenv("SUPERVISOR_URL", "http://localhost:5000")

# Optional Web3 / on-chain integration
ENABLE_IMPACT_NFT = os.getenv("ENABLE_IMPACT_NFT", "false").lower() == "true"
WEB3_RPC_URL = os.getenv("WEB3_RPC_URL", "")
WEB3_CHAIN_ID = int(os.getenv("WEB3_CHAIN_ID", "0"))  # 0 = disabled / mock‑only
WEB3_IMPACT_NFT_CONTRACT_ADDRESS = os.getenv("WEB3_IMPACT_NFT_CONTRACT_ADDRESS", "")
WEB3_IMPACT_NFT_PRIVATE_KEY = os.getenv("WEB3_IMPACT_NFT_PRIVATE_KEY", "")

# Optional IPFS integration for Impact NFT metadata.
# When unset, metadata is embedded as a data: URI so the demo remains self‑contained.
IPFS_API_URL = os.getenv("IPFS_API_URL", "")

