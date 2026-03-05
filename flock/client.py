import asyncio
import logging
from typing import Dict, List

import aiohttp

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
                    if resp.status in (429, 500, 502, 503, 504):
                        wait_time = 2**attempt
                        logger.warning(
                            "FLock API error %s, retrying in %ss", resp.status, wait_time
                        )
                        await asyncio.sleep(wait_time)
                    else:
                        error_text = await resp.text()
                        raise Exception(f"FLock API error {resp.status}: {error_text}")
        except aiohttp.ClientError as e:
            logger.error("Network error on attempt %s: %s", attempt + 1, e)
            if attempt == retries - 1:
                raise
            await asyncio.sleep(2**attempt)

    raise Exception("Max retries exceeded")

