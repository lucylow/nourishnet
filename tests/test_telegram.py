import aiohttp
import pytest
from unittest.mock import AsyncMock

from channels.telegram import TelegramAdapter


@pytest.mark.asyncio
async def test_send_message_mock_mode() -> None:
    adapter = TelegramAdapter("mock", use_mock=True)
    result = await adapter.send_message("123456", "Test message")
    assert result["status"] == "sent"
    assert result["chat_id"] == "123456"
    assert result["text"] == "Test message"


@pytest.mark.asyncio
async def test_send_message_real_mocked_session() -> None:
    adapter = TelegramAdapter("token", use_mock=False)
    adapter.session = AsyncMock(spec=aiohttp.ClientSession)
    mock_response = AsyncMock()
    mock_response.json.return_value = {
        "ok": True,
        "result": {"message_id": 42},
    }
    adapter.session.post.return_value.__aenter__.return_value = mock_response

    result = await adapter.send_message("123456", "Hello")
    assert result["status"] == "sent"
    assert result["message_id"] == 42
    assert result["chat_id"] == "123456"


@pytest.mark.asyncio
async def test_handle_webhook_parsing() -> None:
    adapter = TelegramAdapter("mock", use_mock=True)
    update = {
        "message": {
            "chat": {"id": 123456},
            "text": "Hello",
            "message_id": 1,
            "date": 123456789,
        }
    }
    parsed = await adapter.handle_webhook(update)
    assert parsed is not None
    assert parsed["user_id"] == "123456"
    assert parsed["message"] == "Hello"
    assert parsed["channel"] == "telegram"

