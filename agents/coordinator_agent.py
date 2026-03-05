import asyncio
from typing import Any, Dict, List, Tuple, Set

import aiohttp

from agents.base_agent import BaseAgent


class CoordinatorAgent(BaseAgent):
    """Coordinator agent: matches surplus with recipients and scores urgency."""

    def __init__(self, mcp_server_url: str):
        super().__init__("CoordinatorAgent", mcp_server_url)
        # In-memory recipient store (would be Redis or DB in production)
        self.recipients: List[Dict[str, Any]] = [
            {
                "id": "ngo1",
                "type": "ngo",
                "name": "City Food Bank",
                "lat": 51.5,
                "lon": -0.12,
                "families": 50,
            },
            {
                "id": "user1",
                "type": "individual",
                "name": "+447911123456",
                "lat": 51.51,
                "lon": -0.13,
                "preferences": ["sandwich"],
            },
        ]

    async def run(self) -> None:
        """Listen for surplus.detected events and match."""
        async for event in self.subscribe("surplus.detected"):
            await self.match_surplus(event["payload"])

    async def get_sponsored_surplus_ids(self) -> Set[str]:
        """Fetch currently sponsored surplus ids from the monetization API."""
        base_url = self.mcp_server_url.rstrip("/")
        sponsored_url = f"{base_url}/monetization/sponsored"
        async with aiohttp.ClientSession() as session:
            async with session.get(sponsored_url) as resp:
                if resp.status != 200:
                    return set()
                data = await resp.json()
                ids = data.get("ids") or []
                return set(str(i) for i in ids)

    async def match_surplus(self, surplus: Dict[str, Any]) -> None:
        """Find best recipients for this surplus and publish match.ready events."""
        sponsored_ids = await self.get_sponsored_surplus_ids()
        surplus_id = str(surplus.get("id") or surplus.get("surplus_id") or "")

        candidates: List[Tuple[Dict[str, Any], float]] = []
        for rec in self.recipients:
            # Distance computation is mocked as 1km for demo purposes
            urgency = await self.compute_urgency(rec, surplus)
            if surplus_id and surplus_id in sponsored_ids:
                urgency = min(1.0, urgency + 0.1)
            candidates.append((rec, urgency))

        # Sort by urgency descending
        candidates.sort(key=lambda x: x[1], reverse=True)
        top_matches = candidates[:2]

        for rec, urgency in top_matches:
            await self.publish_event(
                "match.ready",
                {
                    "surplus": surplus,
                    "recipient": rec,
                    "urgency": urgency,
                    "sponsored": surplus_id in sponsored_ids,
                    "channel": "whatsapp"
                    if rec["type"] == "individual"
                    else "telegram",
                },
            )

    async def compute_urgency(
        self, recipient: Dict[str, Any], surplus: Dict[str, Any]
    ) -> float:
        """Use FLock to score urgency between 0 and 1."""
        food = surplus.get("food_items", ["food item"])[0]
        expiry = surplus.get("expiry", "today")
        prompt = f"""
Score the urgency (0-1) for this food recipient. Output only a number.

Recipient type: {recipient['type']}
Distance: 1 km
Food type: {food}
Expires: {expiry}
"""
        response = await self.call_flock(
            model="mistralai/Mistral-7B-Instruct-v0.3",
            prompt=prompt,
            temperature=0.0,
            max_tokens=10,
        )
        try:
            score = float(response.strip())
            return min(max(score, 0.0), 1.0)
        except Exception:
            return 0.5


async def main() -> None:
    from config import MCP_HOST, MCP_PORT

    agent = CoordinatorAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())

