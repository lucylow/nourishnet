import asyncio
import logging
from typing import Any, Dict, Optional

from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client


logger = logging.getLogger(__name__)


class WhatsAppAdapter:
    """Adapter for sending/receiving WhatsApp messages via Twilio."""

    def __init__(
        self,
        account_sid: str,
        auth_token: str,
        from_number: str,
        use_mock: bool = False,
    ):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.from_number = from_number
        self.use_mock = use_mock

        if not self.use_mock and self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            logger.info("WhatsApp adapter in MOCK mode")

    async def send_message(self, to: str, body: str) -> Dict[str, Any]:
        """
        Send a WhatsApp message.

        Args:
            to: Recipient phone number (with country code, e.g., +447911123456)
            body: Message text

        Returns:
            dict with status and message SID or error info.
        """
        if self.use_mock or not self.client:
            logger.info(f"[MOCK] WhatsApp message to {to}: {body}")
            return {"status": "sent", "sid": "mock_sid", "to": to, "body": body}

        try:
            # Run Twilio's sync client in a thread pool to avoid blocking.
            loop = asyncio.get_event_loop()
            message = await loop.run_in_executor(
                None,
                lambda: self.client.messages.create(
                    body=body,
                    from_=f"whatsapp:{self.from_number}",
                    to=f"whatsapp:{to}",
                ),
            )
            logger.info("WhatsApp message sent to %s, SID: %s", to, message.sid)
            return {"status": "sent", "sid": message.sid, "to": to, "body": body}
        except TwilioRestException as exc:
            logger.error("Twilio error sending to %s: %s", to, exc)
            return {"status": "error", "error": str(exc), "to": to}
        except Exception as exc:  # noqa: BLE001
            logger.error("Unexpected error sending to %s: %s", to, exc)
            return {"status": "error", "error": str(exc), "to": to}

    async def handle_incoming_webhook(self, form_data: dict) -> Optional[dict]:
        """
        Parse incoming Twilio webhook data.

        Args:
            form_data: Dictionary from request.form().

        Returns:
            dict with sender, message body, and metadata, or None if invalid.
        """
        try:
            from_number = (form_data.get("From") or "").replace("whatsapp:", "")
            body = (form_data.get("Body") or "").strip()
            message_sid = form_data.get("MessageSid") or ""

            if not from_number or not body:
                logger.warning("Invalid webhook: missing From or Body")
                return None

            return {
                "channel": "whatsapp",
                "user_id": from_number,
                "message": body,
                "message_sid": message_sid,
                "timestamp": form_data.get("Timestamp"),
            }
        except Exception as exc:  # noqa: BLE001
            logger.error("Error parsing webhook: %s", exc)
            return None

