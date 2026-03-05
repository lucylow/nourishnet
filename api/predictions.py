from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from crisis_prediction.price_forecast import PriceCrisisPredictor
from forecasting.supply_forecast import SupplyForecastModel
from optimization.scenario_analysis import ScenarioAnalysisEngine


router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.get("/supply/{business_id}")
async def supply_forecast(business_id: str, days: int = 14) -> Dict[str, Any]:
    """
    Simple demo endpoint returning a surplus forecast for a business.

    In a production deployment, `historical_donations` would come from the DB.
    For now we synthesise a small pattern so the frontend has realistic‑looking
    data without extra infrastructure.
    """
    # Fake 30 days of gently increasing donations with a weekend bump.
    historical: List[Dict[str, Any]] = []
    base_quantity = 10.0
    for offset in range(30, 0, -1):
        from datetime import date, timedelta

        d = date.today() - timedelta(days=offset)
        qty = base_quantity + (30 - offset) * 0.2
        if d.weekday() >= 5:  # weekend
            qty *= 1.4
        historical.append({"date": d.isoformat(), "quantity": qty})

    model = SupplyForecastModel(business_id=business_id)
    forecast = model.forecast(days=days, historical_donations=historical)
    # Flatten for the dashboard convenience.
    return {"business_id": business_id, "forecast": forecast}


@router.get("/crisis/{region}/{city}")
async def crisis_forecast(region: str, city: str) -> Dict[str, Any]:
    """
    Demo endpoint exposing a price‑crisis prediction for a region/city pair.
    """
    # Synthetic recent sequence of daily prices with a modest upward trend.
    base_price = 1.0
    recent: List[Dict[str, Any]] = []
    for i in range(30):
        price = base_price * (1.0 + i * 0.01)
        recent.append({"day": i, "price": price})

    predictor = PriceCrisisPredictor()
    prediction = predictor.predict_price_crisis(recent)
    return {
        "region": region,
        "city": city,
        "prediction": prediction,
    }


@router.post("/scenario")
async def scenario_analysis(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Rank diversion strategies for a given surplus.

    Expects:
    {
      "food_type": "...",
      "quantity_kg": <float>,
      "location": "...",
      "preferences": { "weights": { ... } }   # optional
    }
    """
    required = {"food_type", "quantity_kg", "location"}
    if not required.issubset(payload):
        missing = required - set(payload)
        raise HTTPException(status_code=400, detail=f"Missing fields: {', '.join(sorted(missing))}")

    engine = ScenarioAnalysisEngine()
    result = engine.analyze_scenario(
        food_type=str(payload["food_type"]),
        quantity_kg=float(payload["quantity_kg"]),
        location=str(payload["location"]),
        preferences=payload.get("preferences"),
    )
    return result


