from __future__ import annotations

import pytest

from onchain.impact_nft import ImpactNFTClient, build_metadata_from_surplus


def test_build_metadata_from_surplus_basic() -> None:
    surplus = {
        "business": "Test Cafe",
        "food_items": ["sandwiches"],
        "quantity": "10",
        "co2_kg": 5.0,
        "id": "surplus-123",
    }

    meta = build_metadata_from_surplus(surplus, recipient_type="ngo")
    assert meta.business_name == "Test Cafe"
    assert meta.food_type == "sandwiches"
    assert meta.quantity == "10"
    assert meta.co2_kg == 5.0
    assert meta.recipient_type == "ngo"
    assert meta.surplus_id == "surplus-123"


@pytest.mark.asyncio
async def test_mint_impact_nft_mock_mode() -> None:
    client = ImpactNFTClient()
    assert not client.enabled

    surplus = {
        "business": "Mock Bakery",
        "food_items": ["bread"],
        "quantity": "5",
    }
    meta = build_metadata_from_surplus(surplus)

    result = await client.mint_impact_nft(
        business_address="0x0000000000000000000000000000000000000000",
        metadata=meta,
    )

    assert result["status"] == "mock"
    assert result["business"] == "0x0000000000000000000000000000000000000000"
    assert "metadata_uri" in result

    # Inline metadata URIs should contain a standards-friendly NFT JSON payload.
    uri: str = result["metadata_uri"]
    assert uri.startswith("data:application/json,")
    json_payload = uri.split(",", 1)[1]
    data = json.loads(json_payload)

    assert data["name"].startswith("NourishNet Impact")
    assert isinstance(data["attributes"], list)
    trait_types = {attr["trait_type"] for attr in data["attributes"]}
    # Core traits should always be present
    assert {"Business", "Food Type", "Quantity", "CO₂ Saved (kg)"}.issubset(trait_types)

