import asyncio
import logging
from typing import Any, Dict

from agents.base_agent import BaseAgent
from onchain.impact_nft import ImpactNFTClient, build_metadata_from_surplus

logger = logging.getLogger(__name__)


class ImpactAgent(BaseAgent):
    """
    Web3 / blockchain bridge agent.

    Listens for `pickup.confirmed` events from the LogisticsAgent and mints
    Impact NFTs to provide an auditable on‑chain record of each rescue.
    """

    def __init__(self, mcp_server_url: str):
        super().__init__("ImpactAgent", mcp_server_url)
        self.nft_client = ImpactNFTClient()

    async def run(self) -> None:
        await self._listen_for_pickup_confirmed()

    async def _listen_for_pickup_confirmed(self) -> None:
        async for event in self.subscribe("pickup.confirmed"):
            await self._handle_pickup_confirmed(event["payload"])

    async def _handle_pickup_confirmed(self, payload: Dict[str, Any]) -> None:
        surplus = payload.get("surplus") or {}

        # For Phase 1 we assume the business on‑chain address is carried in the surplus payload.
        # If it's missing, we fall back to mock mode and just log the attempt.
        business_address = surplus.get("business_wallet") or surplus.get("business_address")
        if not business_address:
            logger.info(
                "[ImpactAgent] No business wallet address on surplus; "
                "recording mock Impact NFT only."
            )
            business_address = "0x0000000000000000000000000000000000000000"

        metadata = build_metadata_from_surplus(
            surplus,
            recipient_type=payload.get("recipient_type", "anonymous_recipient"),
        )

        result = await self.nft_client.mint_impact_nft(
            business_address=business_address,
            metadata=metadata,
        )

        await self.publish_event(
            "impact.nft_minted",
            {
                "pickup": payload,
                "nft_result": result,
            },
        )


async def main() -> None:
    from config import MCP_HOST, MCP_PORT

    agent = ImpactAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())

