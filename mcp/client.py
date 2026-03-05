import asyncio
from typing import Any, AsyncGenerator, Dict, Optional

import aiohttp


class MCPClient:
    """
    Lightweight HTTP client for the NourishNet MCP event bus.

    Provides:
    - publish(event_type, payload, source)
    - subscribe(event_type) -> async generator of events
    - elicit(message, schema, context) -> waits for human response
    """

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    async def publish(self, event_type: str, payload: Dict[str, Any], source: str) -> None:
        """Publish an event to the MCP server."""
        url = f"{self.base_url}/publish"
        event = {"type": event_type, "payload": payload, "source": source}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=event) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise RuntimeError(f"MCP publish failed ({resp.status}): {text}")

    async def subscribe(self, event_type: str) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Subscribe to an event type as an async generator.

        This uses simple long-polling against /subscribe/{event_type}.
        """
        url = f"{self.base_url}/subscribe/{event_type}"
        while True:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, timeout=None) as resp:
                        if resp.status == 200:
                            event = await resp.json()
                            yield event
                        else:
                            # Back off briefly on error
                            await asyncio.sleep(1.0)
            except asyncio.CancelledError:
                raise
            except Exception:
                # Network or server error; retry after delay
                await asyncio.sleep(1.0)

    async def elicit(
        self,
        message: str,
        schema: Dict[str, Any],
        context: Dict[str, Any],
        timeout: int = 300,
    ) -> Optional[Dict[str, Any]]:
        """
        Create a human task and wait (poll) for supervisor response.

        Returns the 'data' field if the supervisor accepts, else None.
        """
        create_url = f"{self.base_url}/elicit"
        poll_url_base = f"{self.base_url}/poll"

        async with aiohttp.ClientSession() as session:
            # Create task
            async with session.post(
                create_url,
                json={
                    "message": message,
                    "schema": schema,
                    "context": context,
                    "timeout": timeout,
                },
            ) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json()
                task_id = data.get("task_id")
                if not task_id:
                    return None

            # Poll for response
            start = asyncio.get_event_loop().time()
            while True:
                if asyncio.get_event_loop().time() - start > timeout:
                    return None

                async with session.get(f"{poll_url_base}/{task_id}") as resp:
                    if resp.status == 200:
                        result = await resp.json()
                        # When the task is still pending, the server returns {"status": "pending"}
                        if "action" in result:
                            if result.get("action") == "accept":
                                return result.get("data")
                            return None
                    # Small delay between polls
                    await asyncio.sleep(2.0)

