import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, Dict, List, Optional

from mcp.client import MCPClient
from llm.client import UnifiedLLMClient


logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Abstract base agent with MCP communication and FLock integration."""

    def __init__(self, name: str, mcp_server_url: str):
        self.name = name
        self.mcp_client = MCPClient(mcp_server_url)
        self.running = True
        # Shared, provider‑agnostic LLM client (Groq, FLock, etc.).
        self.llm_client = UnifiedLLMClient(agent_name=name)

    @abstractmethod
    async def run(self) -> None:
        """Main agent loop."""
        raise NotImplementedError

    async def publish_event(self, event_type: str, payload: Dict[str, Any]) -> None:
        """Publish an event to the MCP bus."""
        await self.mcp_client.publish(event_type, payload, source=self.name)

    async def subscribe(self, event_type: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Subscribe to events (async generator)."""
        async for event in self.mcp_client.subscribe(event_type):
            yield event

    async def elicit_human(
        self,
        message: str,
        schema: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
        timeout: int = 300,
    ) -> Optional[Dict[str, Any]]:
        """
        Request human input via MCP's elicit.
        Returns the human's response data (or None if timeout/declined).
        """
        return await self.mcp_client.elicit(message, schema, context or {}, timeout=timeout)

    async def call_flock(
        self,
        model: str,
        prompt: str,
        temperature: float = 0.1,
        max_tokens: int = 150,
        system_message: Optional[str] = None,
        extra_messages: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """
        Call FLock API with a given model and prompt.

        Adds optional system and extra messages so subclasses can implement
        specialised roles, few-shot examples, and constrained formats.
        """
        from flock import flock_inference

        logger.info(
            "[%s] FLock call: model=%s, temperature=%s, max_tokens=%s",
            self.name,
            model,
            temperature,
            max_tokens,
        )

        messages: List[Dict[str, str]] = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        if extra_messages:
            messages.extend(extra_messages)

        try:
            return await flock_inference(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        except Exception as exc:
            logger.exception("[%s] FLock call failed: %s", self.name, exc)
            raise

    async def call_llm(
        self,
        prompt: str,
        *,
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 150,
        system_message: Optional[str] = None,
        extra_messages: Optional[List[Dict[str, str]]] = None,
        provider_order: Optional[List[str]] = None,
    ) -> str:
        """
        Provider‑agnostic LLM helper with fallback (Groq → FLock by default).

        Keeps a compatible interface with call_flock while delegating to the
        unified client so agents can opt‑in incrementally.
        """
        messages: List[Dict[str, str]] = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        if extra_messages:
            messages.extend(extra_messages)

        return await self.llm_client.infer(
            prompt=prompt,
            messages=messages,
            provider_order=provider_order,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    async def stop(self) -> None:
        self.running = False

