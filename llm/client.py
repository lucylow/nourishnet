import logging
from typing import Dict, List, Optional, Sequence

from config import FLOCK_MODELS, GROQ_API_KEY, GROQ_DEFAULT_MODEL
from flock import flock_inference

logger = logging.getLogger(__name__)


class LLMProviderError(Exception):
    """Provider‑specific error when an LLM call fails."""


class BaseLLMProvider:
    """Abstract interface for LLM providers used by UnifiedLLMClient."""

    name: str = "base"

    async def infer(
        self,
        *,
        prompt: str,
        messages: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 256,
    ) -> str:
        raise NotImplementedError


class FLockProvider(BaseLLMProvider):
    """Thin wrapper around the existing FLock client."""

    name = "flock"

    async def infer(
        self,
        *,
        prompt: str,
        messages: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 256,
    ) -> str:
        # If the caller did not supply chat messages, build a simple user‑only message.
        if messages is None:
            messages = [{"role": "user", "content": prompt}]

        # Fall back to the logistics model if none is supplied. Other agents can
        # still override `model` explicitly when calling through the unified
        # helper.
        flock_model = model or FLOCK_MODELS.get("logistics") or FLOCK_MODELS.get(
            "coordinator"
        )

        return await flock_inference(
            model=flock_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )


class GroqProvider(BaseLLMProvider):
    """
    Groq LLM provider.

    Uses Groq's async Python client if GROQ_API_KEY is configured. If the API
    key is missing or the library is not installed, initialisation will fail
    and the provider will be skipped by the UnifiedLLMClient.
    """

    name = "groq"

    def __init__(self, api_key: str, default_model: str) -> None:
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured")

        try:
            from groq import AsyncClient  # type: ignore[import]
        except Exception as exc:  # pragma: no cover - optional dependency
            raise ImportError("groq Python package is not installed") from exc

        self._client = AsyncClient(api_key=api_key)
        self._default_model = default_model

    async def infer(
        self,
        *,
        prompt: str,
        messages: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 256,
    ) -> str:
        # Build messages if caller only supplied a bare prompt.
        if messages is None:
            messages = [{"role": "user", "content": prompt}]

        chosen_model = model or self._default_model

        try:
            response = await self._client.chat.completions.create(
                model=chosen_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        except Exception as exc:  # pragma: no cover - network / API layer
            raise LLMProviderError(f"Groq request failed: {exc}") from exc

        try:
            return response.choices[0].message.content  # type: ignore[return-value]
        except Exception as exc:  # pragma: no cover - defensive parsing
            raise LLMProviderError(f"Unexpected Groq response format: {exc}") from exc


class UnifiedLLMClient:
    """
    Unified LLM client with simple provider‑level fallback.

    Providers are tried in order until one succeeds. This is intentionally
    minimal – it can be extended later with richer routing logic.
    """

    def __init__(
        self,
        *, agent_name: Optional[str] = None
    ) -> None:
        self.agent_name = agent_name or "agent"

        self._providers: Dict[str, BaseLLMProvider] = {}
        self._providers["flock"] = FLockProvider()

        # Groq is optional – only add if key and dependency are present.
        if GROQ_API_KEY:
            try:
                self._providers["groq"] = GroqProvider(
                    api_key=GROQ_API_KEY,
                    default_model=GROQ_DEFAULT_MODEL,
                )
                logger.info(
                    "[%s] Groq provider initialised with model %s",
                    self.agent_name,
                    GROQ_DEFAULT_MODEL,
                )
            except Exception as exc:
                logger.warning(
                    "[%s] Groq provider disabled: %s", self.agent_name, exc
                )

    async def infer(
        self,
        prompt: str,
        *,
        messages: Optional[List[Dict[str, str]]] = None,
        provider_order: Optional[Sequence[str]] = None,
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 256,
    ) -> str:
        """
        Try multiple providers in sequence until one succeeds.

        - `prompt` is kept for convenience and is used to build messages when
          a provider did not receive explicit chat messages.
        - `provider_order` defaults to Groq‑then‑FLock when Groq is available,
          otherwise it falls back to FLock only.
        """
        if provider_order is None:
            if "groq" in self._providers:
                provider_order = ("groq", "flock")
            else:
                provider_order = ("flock",)

        last_error: Optional[Exception] = None

        for provider_name in provider_order:
            provider = self._providers.get(provider_name)
            if not provider:
                continue

            try:
                logger.info(
                    "[%s] LLM call via provider=%s, model=%s, temperature=%s, max_tokens=%s",
                    self.agent_name,
                    provider_name,
                    model,
                    temperature,
                    max_tokens,
                )
                return await provider.infer(
                    prompt=prompt,
                    messages=messages,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "[%s] Provider %s failed: %s",
                    self.agent_name,
                    provider_name,
                    exc,
                )
                continue

        raise LLMProviderError(
            f"[{self.agent_name}] All LLM providers failed after trying: "
            f"{', '.join(provider_order)}. Last error: {last_error}"
        )

