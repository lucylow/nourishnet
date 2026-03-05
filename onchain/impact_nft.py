from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Dict, Optional

from config import (
    ENABLE_IMPACT_NFT,
    IPFS_API_URL,
    WEB3_CHAIN_ID,
    WEB3_IMPACT_NFT_CONTRACT_ADDRESS,
    WEB3_IMPACT_NFT_PRIVATE_KEY,
    WEB3_RPC_URL,
)

logger = logging.getLogger(__name__)


@dataclass
class ImpactMetadata:
    """Structured metadata for a single rescued surplus batch."""

    business_name: str
    food_type: str
    quantity: str
    co2_kg: float
    recipient_type: str
    rescued_at: str
    surplus_id: Optional[str] = None


class ImpactNFTClient:
    """
    Minimal client for minting Impact NFTs.

    - In mock mode (default) this only logs what *would* be sent on‑chain.
    - When Web3 is configured but IPFS is not, metadata is embedded as a `data:` URI.
    - When IPFS is configured, JSON metadata is uploaded and the on‑chain URI is `ipfs://<cid>`.
    """

    def __init__(self) -> None:
        self.enabled = ENABLE_IMPACT_NFT and bool(
            WEB3_RPC_URL and WEB3_IMPACT_NFT_CONTRACT_ADDRESS and WEB3_IMPACT_NFT_PRIVATE_KEY
        )

        self._web3 = None
        self._contract = None
        self._ipfs_client = None

        if self.enabled:
            try:
                # Lazy import so environments without web3 can still run in mock mode.
                from web3 import Web3

                self._web3 = Web3(Web3.HTTPProvider(WEB3_RPC_URL))
                if not self._web3.is_connected():
                    logger.warning("Web3 HTTP provider not reachable; falling back to mock mode.")
                    self.enabled = False
                    return

                # In a real deployment the ABI would be loaded from a compiled artifact.
                # For now we assume the contract exposes a `mintImpact(address,string)` entrypoint
                # matching the example Solidity contract in the docs.
                minimal_abi = [
                    {
                        "inputs": [
                            {"internalType": "address", "name": "business", "type": "address"},
                            {"internalType": "string", "name": "metadataURI", "type": "string"},
                        ],
                        "name": "mintImpact",
                        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                        "stateMutability": "nonpayable",
                        "type": "function",
                    }
                ]

                self._contract = self._web3.eth.contract(
                    address=self._web3.to_checksum_address(WEB3_IMPACT_NFT_CONTRACT_ADDRESS),
                    abi=minimal_abi,
                )
            except Exception as exc:  # pragma: no cover - defensive guardrail
                logger.exception("Failed to initialise Web3 ImpactNFT client: %s", exc)
                self.enabled = False

        # IPFS is always optional; if configuration is missing or the client fails to
        # initialise we silently stay in inline `data:` URI mode.
        if IPFS_API_URL:
            try:
                import ipfshttpclient  # type: ignore[import]

                # ipfshttpclient supports both multiaddr strings and HTTP URLs.
                self._ipfs_client = ipfshttpclient.connect(IPFS_API_URL)
                logger.info("[ImpactNFT] IPFS client initialised (url=%s)", IPFS_API_URL)
            except Exception as exc:  # pragma: no cover - defensive guardrail
                logger.warning(
                    "[ImpactNFT] Failed to initialise IPFS client (%s); falling back to data: URIs",
                    exc,
                )
                self._ipfs_client = None

    def _build_metadata_payload(self, meta: ImpactMetadata) -> Dict[str, Any]:
        """
        Build a standards-friendly ERC‑721 metadata JSON document from ImpactMetadata.

        The payload follows the common NFT schema of:
        - name
        - description
        - image (optional, omitted here)
        - attributes: [{ trait_type, value }]
        """
        name = f"NourishNet Impact – {meta.business_name}"
        description = (
            f"{meta.quantity} {meta.food_type} rescued for {meta.recipient_type} "
            f"on {meta.rescued_at}"
        ).strip()

        attributes = [
            {"trait_type": "Business", "value": meta.business_name},
            {"trait_type": "Food Type", "value": meta.food_type},
            {"trait_type": "Quantity", "value": meta.quantity},
            {"trait_type": "CO₂ Saved (kg)", "value": meta.co2_kg},
            {"trait_type": "Recipient Type", "value": meta.recipient_type},
            {"trait_type": "Rescued At", "value": meta.rescued_at},
        ]

        if meta.surplus_id:
            attributes.append({"trait_type": "Surplus ID", "value": meta.surplus_id})

        return {
            "name": name,
            "description": description,
            "attributes": attributes,
        }

    def _build_inline_metadata_uri(self, meta: ImpactMetadata) -> str:
        """
        Build a metadata URI using an inline `data:` payload.

        This keeps the demo self‑contained and is used whenever IPFS is not configured.
        """
        payload = json.dumps(self._build_metadata_payload(meta), separators=(",", ":"))
        return f"data:application/json,{payload}"

    async def _build_metadata_uri(self, meta: ImpactMetadata) -> str:
        """
        Build a metadata URI, preferring IPFS if configured.

        When an IPFS client is available we upload the JSON and return an `ipfs://` URI.
        Otherwise we fall back to an inline `data:` URI.
        """
        if not self._ipfs_client:
            return self._build_inline_metadata_uri(meta)

        loop = asyncio.get_event_loop()
        payload = json.dumps(self._build_metadata_payload(meta), separators=(",", ":")).encode(
            "utf-8"
        )

        try:
            # Offload potentially blocking IPFS I/O to a thread executor.
            cid = await loop.run_in_executor(None, self._ipfs_client.add_bytes, payload)
            uri = f"ipfs://{cid}"
            logger.info("[ImpactNFT] Uploaded metadata to IPFS: cid=%s", cid)
            return uri
        except Exception as exc:  # pragma: no cover - defensive guardrail
            logger.warning(
                "[ImpactNFT] IPFS upload failed (%s); falling back to data: URI", exc
            )
            return self._build_inline_metadata_uri(meta)

    async def mint_impact_nft(
        self,
        *,
        business_address: str,
        metadata: ImpactMetadata,
    ) -> Dict[str, Any]:
        """
        Mint an Impact NFT for a confirmed pickup.

        Always returns a structured dict so callers can log or surface
        basic status to dashboards.
        """
        metadata_uri = await self._build_metadata_uri(metadata)

        if not self.enabled or self._web3 is None or self._contract is None:
            logger.info(
                "[ImpactNFT] Mock mint: business=%s uri=%s payload=%s",
                business_address,
                metadata_uri,
                asdict(metadata),
            )
            return {
                "status": "mock",
                "business": business_address,
                "metadata_uri": metadata_uri,
                "tx_hash": None,
            }

        try:
            from web3 import Web3

            account = self._web3.eth.account.from_key(WEB3_IMPACT_NFT_PRIVATE_KEY)
            nonce = self._web3.eth.get_transaction_count(account.address)

            tx = self._contract.functions.mintImpact(
                Web3.to_checksum_address(business_address),
                metadata_uri,
            ).build_transaction(
                {
                    "from": account.address,
                    "nonce": nonce,
                    "chainId": WEB3_CHAIN_ID or self._web3.eth.chain_id,
                    "gasPrice": self._web3.eth.gas_price,
                }
            )

            signed = account.sign_transaction(tx)
            tx_hash = self._web3.eth.send_raw_transaction(signed.raw_transaction)

            logger.info(
                "[ImpactNFT] Submitted mint tx: hash=%s business=%s", tx_hash.hex(), business_address
            )
            return {
                "status": "submitted",
                "business": business_address,
                "metadata_uri": metadata_uri,
                "tx_hash": tx_hash.hex(),
            }
        except Exception as exc:  # pragma: no cover - defensive guardrail
            logger.exception("[ImpactNFT] Failed to mint NFT: %s", exc)
            return {
                "status": "error",
                "business": business_address,
                "metadata_uri": metadata_uri,
                "tx_hash": None,
                "error": str(exc),
            }


def build_metadata_from_surplus(
    surplus: Dict[str, Any],
    *,
    recipient_type: str = "anonymous_recipient",
) -> ImpactMetadata:
    """
    Helper to convert a NourishNet surplus payload into ImpactMetadata.
    """
    food_items = surplus.get("food_items") or []
    food_type = food_items[0] if food_items else "mixed"

    co2_kg = float(surplus.get("co2_kg", 0.0))
    # If CO2 isn't present yet, a simple heuristic placeholder keeps the flow working.
    if not co2_kg and surplus.get("quantity"):
        try:
            co2_kg = float(surplus["quantity"]) * 1.5
        except Exception:
            co2_kg = 0.0

    rescued_at = surplus.get("rescued_at") or datetime.utcnow().isoformat()

    return ImpactMetadata(
        business_name=surplus.get("business", "Unknown Business"),
        food_type=food_type,
        quantity=str(surplus.get("quantity", "")),
        co2_kg=co2_kg,
        recipient_type=recipient_type,
        rescued_at=rescued_at,
        surplus_id=str(surplus.get("id") or surplus.get("surplus_id") or ""),
    )

