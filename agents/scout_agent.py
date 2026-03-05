import asyncio
import json
from typing import Any, Dict, List

from agents.base_agent import BaseAgent


class ScoutAgent(BaseAgent):
    """Scout agent: detects surplus food and structures listings."""

    def __init__(self, mcp_server_url: str):
        super().__init__("ScoutAgent", mcp_server_url)
        # For demo, run more frequently than once per hour
        self.scan_interval = 30  # seconds

    async def run(self) -> None:
        """Main loop: periodically scan for new surplus listings."""
        while self.running:
            listings = await self.fetch_new_listings()
            for raw_listing in listings:
                await self.process_listing(raw_listing)
            await asyncio.sleep(self.scan_interval)

    async def fetch_new_listings(self) -> List[Dict[str, Any]]:
        """Mock method – in reality would call an API or read from queue."""
        # For demo, return a static listing
        return [
            {
                "business": "Sunrise Bakery",
                "text": "3 unsold sandwiches, best before today",
            }
        ]

    async def process_listing(self, raw: Dict[str, Any]) -> None:
        """Extract structured data using FLock. If low confidence, ask human."""
        prompt = f"""
Extract structured data from this food surplus message. Respond with JSON only.
Fields:
- food_items: list of strings
- quantity: integer number of individual items
- expiry: ISO date (YYYY-MM-DD) if possible, else 'today'
- category: one of ["bakery", "hot_meal", "grocery", "other"]

Message: "{raw['text']}"
"""
        response = await self.call_flock(
            model="meta-llama/Meta-Llama-3.1-8B-Instruct",
            prompt=prompt,
            temperature=0.0,
            max_tokens=200,
        )
        try:
            data = json.loads(response)
            confidence = self.estimate_confidence(data, raw["text"])
        except Exception:
            data = None
            confidence = 0.0

        if data and confidence >= 0.9:
            await self.publish_event(
                "surplus.detected",
                {
                    "business": raw["business"],
                    "food_items": data.get("food_items", []),
                    "quantity": data.get("quantity", 0),
                    "expiry": data.get("expiry", "today"),
                    "category": data.get("category", "other"),
                    "raw_text": raw["text"],
                },
            )
        else:
            schema = {
                "type": "object",
                "properties": {
                    "food_items": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of food items available.",
                    },
                    "quantity": {
                        "type": "integer",
                        "description": "Total count of items.",
                    },
                    "expiry": {
                        "type": "string",
                        "format": "date",
                        "description": "Best before date (YYYY-MM-DD).",
                    },
                    "category": {
                        "type": "string",
                        "enum": ["bakery", "hot_meal", "grocery", "other"],
                    },
                },
                "required": ["food_items", "quantity", "expiry", "category"],
            }
            context = {
                "original_listing": raw["text"],
                "business": raw["business"],
            }
            human_data = await self.elicit_human(
                "Please clarify this food listing:", schema, context
            )
            if human_data:
                await self.publish_event(
                    "surplus.detected",
                    {
                        "business": raw["business"],
                        **human_data,
                        "raw_text": raw["text"],
                    },
                )

    def estimate_confidence(self, data: Dict[str, Any], raw_text: str) -> float:
        """Simple heuristic: if all fields present, high confidence."""
        required = ["food_items", "quantity", "expiry", "category"]
        if not isinstance(data, dict):
            return 0.0
        if all(k in data for k in required):
            return 1.0
        return 0.5


async def main() -> None:
    from config import MCP_HOST, MCP_PORT

    agent = ScoutAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())

