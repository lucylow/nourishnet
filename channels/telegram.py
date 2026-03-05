import logging
import os
from typing import Any, Dict, Optional

import aiohttp

logger = logging.getLogger(__name__)


class TelegramAdapter:
    """Adapter for sending/receiving Telegram messages via Bot API."""

    def __init__(
        self,
        bot_token: str,
        webhook_url: Optional[str] = None,
        use_mock: bool = False,
    ):
        self.bot_token = bot_token
        self.base_url = f"https://api.telegram.org/bot{bot_token}" if bot_token else ""
        self.webhook_url = webhook_url
        self.use_mock = use_mock or not bot_token or bot_token == "mock"
        self.session: Optional[aiohttp.ClientSession] = None

        if self.use_mock:
            logger.info("Telegram adapter in MOCK mode")

    async def _ensure_session(self) -> None:
        """Lazily create an aiohttp session."""
        if self.session is None:
            timeout = aiohttp.ClientTimeout(total=10)
            self.session = aiohttp.ClientSession(timeout=timeout)

    async def start(self) -> None:
        """
        Initialize aiohttp session and set webhook if configured.

        In this codebase, the MCP FastAPI server already exposes /webhook/telegram,
        so setting the webhook is optional and mostly useful for standalone runs.
        """
        await self._ensure_session()
        if self.webhook_url and not self.use_mock:
            await self.set_webhook(self.webhook_url)

    async def stop(self) -> None:
        """Clean up session."""
        if self.session:
            await self.session.close()
            self.session = None

    async def set_webhook(self, url: str) -> bool:
        """Set Telegram webhook to the given URL."""
        if self.use_mock or not self.base_url:
            logger.info("[MOCK] Set Telegram webhook to %s", url)
            return True

        try:
            await self._ensure_session()
            assert self.session is not None  # for type checkers
            async with self.session.post(
                f"{self.base_url}/setWebhook", json={"url": url}
            ) as resp:
                data = await resp.json()
                if data.get("ok"):
                    logger.info("Telegram webhook set to %s", url)
                    return True
                logger.error("Failed to set Telegram webhook: %s", data)
                return False
        except Exception as exc:  # noqa: BLE001
            logger.error("Error setting Telegram webhook: %s", exc)
            return False

    async def send_message(
        self,
        chat_id: str,
        text: str,
        parse_mode: str = "HTML",
    ) -> Dict[str, Any]:
        """
        Send a Telegram message via Bot API.

        Args:
            chat_id: Telegram chat ID (string or integer)
            text: Message text
            parse_mode: 'HTML' or 'Markdown'

        Returns:
            dict with status and message info or error description.
        """
        if self.use_mock:
            logger.info("[MOCK] Telegram message to %s: %s", chat_id, text)
            return {
                "status": "sent",
                "message_id": "mock",
                "chat_id": chat_id,
                "text": text,
            }

        if not self.base_url:
            logger.error("Telegram bot token not configured")
            return {"status": "error", "error": "missing_bot_token", "chat_id": chat_id}

        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
        }

        try:
            await self._ensure_session()
            assert self.session is not None  # for type checkers
            async with self.session.post(
                f"{self.base_url}/sendMessage", json=payload
            ) as resp:
                result = await resp.json()
                if result.get("ok"):
                    message = result["result"]
                    logger.info(
                        "Telegram message sent to %s, message_id: %s",
                        chat_id,
                        message.get("message_id"),
                    )
                    return {
                        "status": "sent",
                        "message_id": message.get("message_id"),
                        "chat_id": chat_id,
                        "text": text,
                    }
                logger.error("Telegram API error: %s", result)
                return {
                    "status": "error",
                    "error": result.get("description", "api_error"),
                    "chat_id": chat_id,
                }
        except Exception as exc:  # noqa: BLE001
            logger.error("Exception sending Telegram message to %s: %s", chat_id, exc)
            return {"status": "error", "error": str(exc), "chat_id": chat_id}

    async def handle_webhook(self, update: dict) -> Optional[dict]:
        """
        Parse incoming Telegram update (message).

        Args:
            update: JSON dict from Telegram webhook.

        Returns:
            dict with channel, user_id, message, and metadata, or None if not a text
            message update.
        """
        try:
            message = update.get("message")
            if not message:
                return None

            chat = message.get("chat") or {}
            chat_id = chat.get("id")
            text = (message.get("text") or "").strip()
            if not chat_id or not text:
                return None

            return {
                "channel": "telegram",
                "user_id": str(chat_id),
                "message": text,
                "metadata": {
                    "message_id": message.get("message_id"),
                    "date": message.get("date"),
                    "chat": chat,
                },
            }
        except Exception as exc:  # noqa: BLE001
            logger.error("Error parsing Telegram webhook: %s", exc)
            return None


def from_env() -> "TelegramAdapter":
    """
    Convenience constructor reading settings from environment variables.

    TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_URL, USE_MOCK_TELEGRAM control behaviour.
    """
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "mock")
    webhook_url = os.getenv("TELEGRAM_WEBHOOK_URL") or None
    use_mock = os.getenv("USE_MOCK_TELEGRAM", "false").lower() == "true"
    return TelegramAdapter(bot_token=bot_token, webhook_url=webhook_url, use_mock=use_mock)

