import random
from typing import Dict, List


async def flock_inference(model: str, messages: List[Dict[str, str]], **kwargs) -> str:
    """
    Mock FLock client used for local development and demos without real API calls.
    Returns canned responses based on simple keyword matching.
    """
    prompt = messages[-1]["content"].lower() if messages else ""

    if "extract" in prompt or "structured data" in prompt:
        return (
            '{"food_items": ["sandwich"], "quantity": 3, '
            '"expiry": "today", "category": "bakery"}'
        )
    if "score" in prompt or "urgency" in prompt:
        return str(round(random.uniform(0.5, 0.95), 2))

    return "I'm here to help with food rescue. How can I assist?"

