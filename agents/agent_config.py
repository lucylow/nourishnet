import asyncio
import json
import os
from typing import Any, Dict, Optional

from web3 import Web3


class OnChainConfig:
    """
    Lightweight helper for reading NourishNet agent configuration
    from the on-chain AgentConfig contract.

    The contract is expected to expose a public `config()` getter that returns:
      (scoutScanInterval, matchingRadius, urgencyNgoBoost, urgencyExpiryBoost)

    Environment variables:
      - AGENT_CONFIG_ADDRESS: deployed AgentConfig contract address
      - WEB3_PROVIDER: HTTP RPC URL (e.g. https://rpc.ankr.com/polygon_amoy)
    """

    def __init__(self, contract_address: str, web3_provider: str, abi_path: str | None = None) -> None:
        if not web3_provider:
            raise ValueError("WEB3_PROVIDER is required for OnChainConfig")
        if not contract_address:
            raise ValueError("AGENT_CONFIG_ADDRESS is required for OnChainConfig")

        self.w3 = Web3(Web3.HTTPProvider(web3_provider))

        abi_file = abi_path or os.getenv("AGENT_CONFIG_ABI_PATH", "abis/AgentConfig.json")
        with open(abi_file) as f:
            abi: Dict[str, Any] = json.load(f)["abi"]

        self.contract = self.w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=abi)
        self.cache: Dict[str, Any] = {}
        self.cache_until: float = 0.0

    async def get(self, key: str) -> Optional[Any]:
        """
        Read a single config value, refreshing the cache at most every 5 minutes.
        """
        loop_time = asyncio.get_event_loop().time()
        if loop_time > self.cache_until:
            config_tuple = self.contract.functions.config().call()
            self.cache = {
                "scoutScanInterval": config_tuple[0],
                "matchingRadius": config_tuple[1],
                "urgencyNgoBoost": config_tuple[2],
                "urgencyExpiryBoost": config_tuple[3],
            }
            self.cache_until = loop_time + 300

        return self.cache.get(key)


def build_default_onchain_config() -> OnChainConfig:
    """
    Convenience constructor that pulls settings from environment variables.
    """
    return OnChainConfig(
        contract_address=os.getenv("AGENT_CONFIG_ADDRESS", ""),
        web3_provider=os.getenv("WEB3_PROVIDER", ""),
    )

