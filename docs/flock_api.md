## FLock API Integration in NourishNet

All AI capabilities in NourishNet – entity extraction, urgency scoring, and conversational Q&A – are powered by **open‑source LLMs** served through the **FLock API**. This document explains how we integrate FLock into the application, including configuration, request/response handling, error management, and model selection per agent.

---

### 1. FLock API Overview

FLock provides a unified interface to many open‑source models (Llama, Mistral, Gemma, etc.). The API is compatible with the OpenAI Chat Completion format, making it easy to integrate.

**Base URL:** `https://api.flock.io/v1`  
**Authentication:** Bearer token in the `Authorization` header.

**Example request (Python with `requests`):**

```python
import requests

response = requests.post(
    "https://api.flock.io/v1/chat/completions",
    headers={"Authorization": "Bearer YOUR_FLOCK_KEY"},
    json={
        "model": "meta-llama/Meta-Llama-3.1-8B-Instruct",
        "messages": [
            {"role": "system", "content": "You extract structured data from food surplus messages."},
            {"role": "user", "content": "We have 5 unsold croissants."}
        ],
        "temperature": 0.1,
        "max_tokens": 150
    }
)
data = response.json()
assistant_message = data["choices"][0]["message"]["content"]
```

---

### 2. Configuration

We use `config.py` to hold the FLock API key and other settings:

```python
# config.py
import os

FLOCK_API_KEY = os.getenv("FLOCK_API_KEY", "your-flock-api-key")
FLOCK_API_URL = "https://api.flock.io/v1/chat/completions"
FLOCK_MODELS = {
    "scout": "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "coordinator": "mistralai/Mistral-7B-Instruct-v0.3",
    "logistics": "google/gemma-2b-it"
}
```

In the actual codebase, `FLOCK_API_URL` is configurable via `FLOCK_API_URL` in the environment and defaults to the same chat completions endpoint.

Store your API key in an environment variable (or `.env` file) for security.

---

### 3. FLock Client Module

NourishNet uses a reusable asynchronous client (`flock/client.py`) that handles requests, retries, and errors.

```python
# flock/client.py
import aiohttp
import asyncio
import logging
from typing import Dict, List

from config import FLOCK_API_KEY, FLOCK_API_URL

logger = logging.getLogger(__name__)


async def flock_inference(
    model: str,
    messages: List[Dict[str, str]],
    temperature: float = 0.1,
    max_tokens: int = 150,
    retries: int = 3,
) -> str:
    """
    Call FLock API with the given model and messages.
    Returns the assistant's reply as a string and retries on transient errors.
    """
    headers = {
        "Authorization": f"Bearer {FLOCK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    for attempt in range(retries):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    FLOCK_API_URL, json=payload, headers=headers
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data["choices"][0]["message"]["content"]
                    elif resp.status in (429, 500, 502, 503, 504):
                        # Rate limit or server error – retry after delay
                        wait_time = 2 ** attempt  # exponential backoff
                        logger.warning(f"FLock API error {resp.status}, retrying in {wait_time}s")
                        await asyncio.sleep(wait_time)
                    else:
                        # Other error, don't retry
                        error_text = await resp.text()
                        raise Exception(f"FLock API error {resp.status}: {error_text}")
        except aiohttp.ClientError as e:
            logger.error(f"Network error on attempt {attempt+1}: {e}")
            if attempt == retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)

    raise Exception("Max retries exceeded")
```

This is wired into agents via the shared `BaseAgent.call_flock` helper, which constructs the `messages` list from each agent’s prompt and optional system/extra messages.

---

### 4. Agent‑Specific Integration

Each agent relies on `BaseAgent.call_flock`, which wraps `flock_inference` and handles model selection, prompt construction, and logging.

#### 4.1 Scout Agent – Entity Extraction

**Purpose:** Convert free‑text surplus listings into structured JSON.

```python
# agents/scout_agent.py (excerpt)
import json

async def process_listing(self, raw: dict):
    prompt = f"""
Extract structured data from this food surplus message. Respond with JSON only.
Fields:
- food_items: list of strings
- quantity: integer number of individual items
- expiry: ISO date (YYYY-MM-DD) if possible, else 'today'
- category: one of ["bakery", "hot_meal", "grocery", "other"]

Message: "{raw['text']}"
"""
    response = await self.call_flock(
        model="meta-llama/Meta-Llama-3.1-8B-Instruct",
        prompt=prompt,
        temperature=0.0,
        max_tokens=200,
    )
    try:
        data = json.loads(response)
    except json.JSONDecodeError:
        data = None
```

If extraction fails or the JSON is incomplete, the Scout Agent falls back to `elicit_human(...)` to request clarification via the supervisor dashboard, then publishes a `surplus.detected` event using the human-provided data.

#### 4.2 Coordinator Agent – Urgency Scoring

**Purpose:** Output a single float score \([0, 1]\) indicating how urgently a recipient needs the food.

```python
# agents/coordinator_agent.py (excerpt)
async def compute_urgency(self, recipient: dict, surplus: dict) -> float:
    food = surplus.get("food_items", ["food item"])[0]
    expiry = surplus.get("expiry", "today")
    prompt = f"""
Score the urgency (0-1) for this food recipient. Output only a number.

Recipient type: {recipient['type']}
Distance: 1 km
Food type: {food}
Expires: {expiry}
"""
    response = await self.call_flock(
        model="mistralai/Mistral-7B-Instruct-v0.3",
        prompt=prompt,
        temperature=0.0,
        max_tokens=10,
    )
    try:
        score = float(response.strip())
        return min(max(score, 0.0), 1.0)
    except Exception:
        return 0.5  # default fallback
```

#### 4.3 Logistics Agent – Conversational Q&A

**Purpose:** Understand user intent and generate helpful replies.

```python
# agents/logistics_agent.py (excerpt)
async def handle_incoming_message(self, user_id: str, text: str) -> None:
    conv = self.conversations.get(user_id)
    if not conv:
        return

    if conv["state"] == "awaiting_reply":
        prompt = (
            f"User said: '{text}'. Does this confirm pickup? "
            "Answer with yes or no and a very short justification."
        )
        response = await self.call_flock(
            model="google/gemma-2b-it",
            prompt=prompt,
            temperature=0.3,
            max_tokens=32,
        )
        # ...
```

---

### 5. Error Handling & Fallbacks

The FLock client includes retries with exponential backoff. If all retries fail, each agent has a fallback strategy:

- **Scout Agent:** If extraction fails, it escalates to a human task via `elicit_human`, surfaced in the supervisor dashboard.
- **Coordinator Agent:** Uses a rule‑based or default urgency score (e.g. `0.5`) if the model fails or returns non‑numeric output.
- **Logistics Agent:** If FLock fails, it falls back to a generic message such as: *"I'm having a technical issue. Please try again later."*

---

### 6. Mock Mode for Development

During hackathon development, you may not have a FLock API key or want to avoid API costs. NourishNet includes a **mock FLock client** that returns predefined responses.

```python
# flock/mock_client.py
import random

async def flock_inference(model: str, messages: list, **kwargs) -> str:
    # Return canned responses based on model and prompt keywords
    prompt = messages[-1]["content"].lower()
    if "extract" in prompt:
        return '{"food_items": ["sandwich"], "quantity": 3, "expiry": "today", "category": "bakery"}'
    elif "score" in prompt:
        return str(round(random.uniform(0.5, 0.95), 2))
    else:
        return "I'm here to help with food rescue. How can I assist?"
```

We conditionally use the real or mock client based on an environment variable, via the `flock` package’s `__init__.py`:

```python
from config import USE_MOCK_FLOCK

if USE_MOCK_FLOCK:
    from .mock_client import flock_inference
else:
    from .client import flock_inference
```

Set `USE_MOCK_FLOCK=true` to enable mock mode.

---

### 7. Environment Variables

Ensure your deployment sets:

```text
FLOCK_API_KEY=your_actual_key
FLOCK_API_URL=https://api.flock.io/v1/chat/completions
USE_MOCK_FLOCK=false   # set to true for local dev without key
```

---

### 8. Bounty Alignment

- **Open‑source models only:** All models used (Llama 3.1, Mistral 7B, Gemma 2B) are open‑source and available via FLock.
- **FLock API for inference:** Every AI call goes through our `flock_inference` wrapper, via `BaseAgent.call_flock`.
- **No proprietary models:** We strictly use models from the FLock open‑source catalogue.

