from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import uvicorn
import asyncio
from typing import Dict, Any, List
import uuid

from api.monetization import router as monetization_router
from api.predictions import router as predictions_router


app = FastAPI(title="NourishNet MCP Event Bus")
app.include_router(monetization_router)
app.include_router(predictions_router)

# In-memory event queues (per event type)
queues: Dict[str, asyncio.Queue] = {}

# Human tasks pending
human_tasks: Dict[str, dict] = {}


class Event(BaseModel):
    type: str
    payload: dict
    source: str


class ElicitRequest(BaseModel):
    message: str
    schema: dict
    context: dict = {}
    timeout: int = 300


class ElicitResponse(BaseModel):
    action: str  # "accept" or "reject"
    data: dict | None = None


@app.post("/publish")
async def publish_event(event: Event) -> dict:
    """Publish an event to all subscribers of that type."""
    if event.type not in queues:
        queues[event.type] = asyncio.Queue()
    await queues[event.type].put(event.dict())
    return {"status": "ok"}


@app.get("/subscribe/{event_type}")
async def subscribe(event_type: str) -> dict:
    """
    Long-poll endpoint for subscribing to an event type.

    Each request returns a single event (blocking until one is available).
    Agents call this in a loop to receive a stream of events.
    """
    if event_type not in queues:
        queues[event_type] = asyncio.Queue()
    event = await queues[event_type].get()
    return event


@app.post("/elicit")
async def create_elicit(req: ElicitRequest) -> dict:
    """Create a human task and return its id."""
    task_id = str(uuid.uuid4())
    human_tasks[task_id] = {
        "request": req.dict(),
        "response": None,
        "created_at": asyncio.get_event_loop().time(),
    }
    return {"task_id": task_id}


@app.post("/respond/{task_id}")
async def respond(task_id: str, response: ElicitResponse) -> dict:
    """Supervisor submits response to a human task."""
    if task_id not in human_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    human_tasks[task_id]["response"] = response.dict()
    return {"status": "ok"}


@app.get("/poll/{task_id}")
async def poll_task(task_id: str) -> dict:
    """Agent polls for human response (simple polling)."""
    task = human_tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["response"]:
        return task["response"]
    return {"status": "pending"}


@app.get("/tasks")
async def list_tasks() -> List[dict]:
    """List all current human tasks for the supervisor dashboard."""
    results: List[dict] = []
    for task_id, t in human_tasks.items():
        req = t["request"]
        results.append(
            {
                "id": task_id,
                "message": req.get("message"),
                "context": req.get("context", {}),
                "schema": req.get("schema", {}),
                "status": "completed" if t["response"] else "pending",
            }
        )
    return results


@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request) -> dict:
    """
    Twilio WhatsApp webhook.

    Normalises the incoming payload and publishes a `logistics.incoming` event
    that the LogisticsAgent subscribes to.
    """
    form = await request.form()
    from_raw = form.get("From")
    body = form.get("Body")

    if not from_raw or body is None:
        raise HTTPException(status_code=400, detail="Missing From or Body")

    # Twilio prepends 'whatsapp:' to the number, strip it off for internal ids
    user_id = from_raw.replace("whatsapp:", "") if "whatsapp:" in from_raw else from_raw

    await publish_event(
        Event(
            type="logistics.incoming",
            payload={"user_id": user_id, "text": body, "channel": "whatsapp"},
            source="whatsapp_webhook",
        )
    )
    return {"status": "ok"}


@app.post("/webhook/telegram")
async def telegram_webhook(update: Dict[str, Any]) -> dict:
    """
    Telegram Bot API webhook.

    Expects the standard update JSON and forwards text messages as
    `logistics.incoming` events.
    """
    message = update.get("message") or {}
    chat = message.get("chat") or {}
    chat_id = chat.get("id")
    text = message.get("text")

    # Ignore non-text or malformed updates
    if not chat_id or text is None:
        return {"status": "ignored"}

    await publish_event(
        Event(
            type="logistics.incoming",
            payload={"user_id": str(chat_id), "text": text, "channel": "telegram"},
            source="telegram_webhook",
        )
    )
    return {"status": "ok"}


def main() -> None:
    from config import MCP_HOST, MCP_PORT

    uvicorn.run(app, host=MCP_HOST, port=MCP_PORT)


if __name__ == "__main__":
    main()

