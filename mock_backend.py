"""
Mock backend server for NourishNet demo.

This lightweight Flask app exposes a couple of HTTP endpoints that return
static / lightly-randomised mock data. It is intended for:

- Driving a frontend dashboard without requiring the MCP server or agents
- Providing predictable demo flows for hackathons and presentations

Endpoints:
- GET /api/events  -> list of recent agent events
- GET /api/tasks   -> list of pending human-in-the-loop tasks

You can run this server with:

    python mock_backend.py

Then point your frontend to `http://localhost:5000/api`.

Note: this is separate from the human supervisor Flask app in
`human_supervisor/app.py`, which also runs on port 5000. For demos you
typically run either this mock backend or the full supervisor dashboard,
but not both at the same time.
"""

from __future__ import annotations

import datetime as dt
import random
from typing import List, Dict, Any

from flask import Flask, jsonify


app = Flask(__name__)


def _iso_now() -> str:
    return dt.datetime.utcnow().isoformat() + "Z"


def _mock_events() -> List[Dict[str, Any]]:
    """Return a small list of recent-looking mock agent events."""
    now = dt.datetime.utcnow()

    base_events = [
        {
            "agent": "scout",
            "message": "New surplus: Sunrise Bakery, 3 sandwiches (expires today)",
            "timestamp": (now - dt.timedelta(seconds=10)).isoformat() + "Z",
        },
        {
            "agent": "coordinator",
            "message": "Matched surplus #123 with City Food Bank (urgency 0.92)",
            "timestamp": (now - dt.timedelta(seconds=25)).isoformat() + "Z",
        },
        {
            "agent": "logistics",
            "message": "WhatsApp sent to +447911123456: pickup code NOURISH5",
            "timestamp": (now - dt.timedelta(seconds=40)).isoformat() + "Z",
        },
        {
            "agent": "human",
            "message": "Supervisor approved match for surplus #122",
            "timestamp": (now - dt.timedelta(minutes=1, seconds=5)).isoformat() + "Z",
        },
    ]

    # Optionally sprinkle in a couple of extra randomised events
    extra_templates = {
        "scout": [
            "Scout scanned 12 businesses, found 2 surplus listings",
            "Surplus detected: Green Cafe, 5 croissants",
            "Low confidence extraction for 'mixed items' – sent to human",
        ],
        "coordinator": [
            "Coordinator matched 3 recipients for surplus #124",
            "No matches found for surplus #125 – archived",
            "Urgency scoring completed for 5 candidates",
        ],
        "logistics": [
            "User replied 'On my way!' – confirming pickup",
            "Reminder sent to user #789 (no reply in 30 min)",
            "Telegram delivered to @foodbank_king: 2 meals available",
        ],
    }

    for agent, messages in extra_templates.items():
        if random.random() < 0.6:
            base_events.append(
                {
                    "agent": agent,
                    "message": random.choice(messages),
                    "timestamp": _iso_now(),
                }
            )

    # Sort newest first for convenience
    base_events.sort(key=lambda e: e["timestamp"], reverse=True)
    return base_events


def _mock_tasks() -> List[Dict[str, Any]]:
    """
    Return a small list of pending human-in-the-loop tasks.

    The shape is intentionally similar to what the MCP server would expose,
    so the same frontend code can be reused.
    """
    return [
        {
            "id": "123",
            "message": "Clarify food listing",
            "context": {
                "original_listing": "3 unsold sandwiches, best before today",
                "business": "Sunrise Bakery",
            },
            "schema": {
                "type": "object",
                "properties": {
                    "food_items": {"type": "array", "items": {"type": "string"}},
                    "quantity": {"type": "integer"},
                    "expiry": {"type": "string", "format": "date"},
                },
                "required": ["food_items", "quantity", "expiry"],
            },
            "createdAt": _iso_now(),
        },
        {
            "id": "456",
            "message": "Approve match",
            "context": {
                "surplus_id": "123",
                "recipient": "City Food Bank",
                "urgency": 0.52,
            },
            "createdAt": _iso_now(),
        },
    ]


@app.get("/api/events")
def get_events() -> Any:
    """Return mock agent events."""
    return jsonify(_mock_events())


@app.get("/api/tasks")
def get_tasks() -> Any:
    """Return mock human-in-the-loop tasks."""
    return jsonify(_mock_tasks())


def main() -> None:
    # Default Flask dev server; in real deployments this would run behind gunicorn/uvicorn.
    app.run(port=5000, debug=True)


if __name__ == "__main__":
    main()

