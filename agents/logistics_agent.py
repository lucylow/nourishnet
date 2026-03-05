import asyncio
from typing import Any, Dict

from agents.base_agent import BaseAgent
from channels.whatsapp import WhatsAppAdapter
from channels.telegram import TelegramAdapter
from config import (
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_WEBHOOK_URL,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER,
    USE_MOCK_TELEGRAM,
    USE_MOCK_WHATSAPP,
)
from knowledge.rag import RAGEngine


class LogisticsAgent(BaseAgent):
    """Logistics agent: messaging, conversation, and pickup confirmation."""

    def __init__(self, mcp_server_url: str):
        super().__init__("LogisticsAgent", mcp_server_url)
        # Track active conversations by messaging user id (phone/chat id)
        self.conversations: Dict[str, Dict[str, Any]] = {}
        # Retrieval‑augmented FAQ helper for knowledge‑grounded answers.
        self.faq_rag = RAGEngine("logistics_faq")
        # WhatsApp adapter (mockable for local dev / tests).
        self.whatsapp = WhatsAppAdapter(
            account_sid=TWILIO_ACCOUNT_SID,
            auth_token=TWILIO_AUTH_TOKEN,
            from_number=TWILIO_WHATSAPP_NUMBER,
            use_mock=USE_MOCK_WHATSAPP
            or TWILIO_ACCOUNT_SID == "mock"
            or TWILIO_AUTH_TOKEN == "mock",
        )
        # Telegram adapter (mockable and webhook-aware).
        self.telegram = TelegramAdapter(
            bot_token=TELEGRAM_BOT_TOKEN,
            webhook_url=TELEGRAM_WEBHOOK_URL or None,
            use_mock=USE_MOCK_TELEGRAM,
        )

    async def run(self) -> None:
        """
        Main loop: listen for new matches and for incoming user messages.

        - `match.ready` events come from the CoordinatorAgent.
        - `logistics.incoming` events are created by channel webhooks (Twilio, Telegram).
        """
        await asyncio.gather(
            self._listen_for_matches(),
            self._listen_for_incoming_messages(),
        )

    async def _listen_for_matches(self) -> None:
        async for event in self.subscribe("match.ready"):
            await self.handle_match(event["payload"])

    async def _listen_for_incoming_messages(self) -> None:
        async for event in self.subscribe("logistics.incoming"):
            payload = event["payload"]
            await self.handle_incoming_message(
                user_id=payload["user_id"],
                text=payload["text"],
                channel=payload.get("channel", "whatsapp"),
            )

    async def handle_match(self, match: Dict[str, Any]) -> None:
        """Send initial message to recipient and start conversation."""
        recipient = match["recipient"]
        channel = match["channel"]
        surplus = match["surplus"]

        message = (
            f"🍱 Free food alert! {surplus['business']} has {surplus['quantity']} "
            f"{surplus['food_items'][0]}. Code: NOURISH5. "
            f"Pick up before {surplus['expiry']}."
        )

        # For WhatsApp we normally use the phone number; for Telegram we use chat id.
        # In this demo, both are carried in `recipient["name"]`.
        user_id = recipient["name"]

        await self.send_message(channel, user_id, message)

        self.conversations[user_id] = {
            "state": "awaiting_reply",
            "match": match,
            "retries": 0,
            "channel": channel,
            "recipient": recipient,
        }

    async def send_message(self, channel: str, user_id: str, text: str) -> None:
        """Channel-agnostic send helper."""
        if channel == "whatsapp":
            await self.send_whatsapp(user_id, text)
        elif channel == "telegram":
            await self.send_telegram(user_id, text)
        else:
            # Fallback: log to stdout for unknown channels
            print(f"[Logistics] Unknown channel '{channel}' for {user_id}: {text}")

    async def send_whatsapp(self, to_number: str, text: str) -> None:
        """
        Send a WhatsApp message via the adapter with basic retry/backoff.
        """
        max_attempts = 3
        delay = 1.0

        last_error: str | None = None
        for attempt in range(1, max_attempts + 1):
            result = await self.whatsapp.send_message(to_number, text)
            if result.get("status") == "sent":
                return

            last_error = result.get("error") or "unknown error"
            if attempt < max_attempts:
                await asyncio.sleep(delay)
                delay *= 2

        print(f"[WhatsApp ERROR] Failed to send to {to_number}: {last_error}")

    async def send_telegram(self, chat_id: str, text: str) -> None:
        """
        Send a Telegram message via the adapter with basic retry/backoff.
        """
        max_attempts = 3
        delay = 1.0

        last_error: str | None = None
        for attempt in range(1, max_attempts + 1):
            result = await self.telegram.send_message(chat_id, text)
            if result.get("status") == "sent":
                return

            last_error = result.get("error") or "unknown error"
            if attempt < max_attempts:
                await asyncio.sleep(delay)
                delay *= 2

        print(f"[Telegram ERROR] Failed to send to {chat_id}: {last_error}")

    async def handle_incoming_message(self, user_id: str, text: str, channel: str) -> None:
        """
        Called when the user replies on any channel.

        In production this is triggered by Twilio/Telegram webhooks via the MCP bus.
        For demos, you can also call this directly from a small harness or REPL.
        """
        conv = self.conversations.get(user_id)
        if not conv:
            return

        if conv["state"] == "awaiting_reply":
            prompt = (
                f"User said: '{text}'. Does this confirm pickup? "
                "Answer strictly with 'yes' or 'no' followed by a short justification."
            )
            # Try Groq first for low‑latency classification, then fall back to FLock.
            response = await self.call_llm(
                prompt=prompt,
                temperature=0.3,
                max_tokens=32,
                provider_order=["groq", "flock"],
            )

            if "yes" in response.lower():
                await self.publish_event(
                    "pickup.confirmed",
                    {
                        "recipient_id": user_id,
                        "recipient_type": conv.get("recipient", {}).get("type", "anonymous_recipient"),
                        "channel": conv.get("channel", channel),
                        "surplus": conv["match"]["surplus"],
                    },
                )
                conv["state"] = "confirmed"
                # Acknowledge the confirmation on the same channel
                await self.send_message(
                    conv.get("channel", channel),
                    user_id,
                    "Great! Your pickup is confirmed. Please show the code NOURISH5 on arrival.",
                )
            else:
                # Try to answer using RAG over the logistics FAQ.
                retrieved_docs = self.faq_rag.retrieve(text, n_results=3)
                if retrieved_docs:
                    qa_prompt = self.faq_rag.augment_prompt(text, retrieved_docs)
                else:
                    qa_prompt = (
                        f"User asked about food pickup: '{text}'. "
                        "Reply in one or two sentences explaining how to claim the food."
                    )

                # Use unified LLM with Groq‑first for FAQ answers as well.
                answer = await self.call_llm(
                    prompt=qa_prompt,
                    temperature=0.4,
                    max_tokens=64,
                    provider_order=["groq", "flock"],
                )
                await self.send_message(conv.get("channel", channel), user_id, answer)


async def main() -> None:
    from config import MCP_HOST, MCP_PORT

    agent = LogisticsAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())

