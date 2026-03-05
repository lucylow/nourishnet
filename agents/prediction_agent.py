import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional

from agents.base_agent import BaseAgent
from crisis_prediction.price_forecast import PriceCrisisPredictor
from forecasting.demand_forecast import FoodInsecurityPredictor
from forecasting.supply_forecast import SupplyForecastModel
from optimization.scenario_analysis import ScenarioAnalysisEngine


logger = logging.getLogger(__name__)


class PredictionAgent(BaseAgent):
    """
    Dedicated agent for prediction and forecasting tasks.

    In this first iteration the agent focuses on:
    - providing helper methods other agents can import and call directly, and
    - emitting human‑readable log events via the MCP bus when explicit
      `prediction.request` events are published.

    The design is intentionally simple and event‑driven, avoiding extra MCP
    abstractions so it fits neatly into the existing architecture.
    """

    def __init__(self, mcp_server_url: str):
        super().__init__("PredictionAgent", mcp_server_url)

        self._supply_models: Dict[str, SupplyForecastModel] = {}
        self._demand_predictor = FoodInsecurityPredictor()
        self._crisis_predictor = PriceCrisisPredictor()
        self._scenario_engine = ScenarioAnalysisEngine()

    async def run(self) -> None:
        """
        Main loop: listen for high‑level prediction requests.

        Other agents can publish:
        - `prediction.request.supply`
        - `prediction.request.demand`
        - `prediction.request.crisis`
        - `prediction.request.scenario`
        with a small JSON payload; this agent responds with corresponding
        `prediction.result.*` events containing structured predictions.
        """
        await asyncio.gather(
            self._listen_supply_requests(),
            self._listen_demand_requests(),
            self._listen_crisis_requests(),
            self._listen_scenario_requests(),
        )

    # ── public helper methods (can also be imported directly) ──

    def forecast_supply_for_business(
        self,
        business_id: str,
        *,
        historical_donations: Iterable[Dict[str, Any]],
        days: int = 7,
    ) -> Dict[str, Any]:
        model = self._supply_models.setdefault(
            business_id, SupplyForecastModel(business_id=business_id)
        )
        return model.forecast(days=days, historical_donations=historical_donations)

    def predict_household_demand(
        self,
        *,
        household_data: Dict[str, Any],
        community_data: Dict[str, Any],
        economic_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        return self._demand_predictor.predict_risk(
            household_data=household_data,
            community_data=community_data,
            economic_data=economic_data,
        )

    def predict_price_crisis(
        self,
        recent_prices: Iterable[Dict[str, Any]],
    ) -> Dict[str, Any]:
        return self._crisis_predictor.predict_price_crisis(recent_prices)

    def analyze_scenario(self, food_data: Dict[str, Any]) -> Dict[str, Any]:
        return self._scenario_engine.analyze_scenario(
            food_type=food_data["food_type"],
            quantity_kg=float(food_data["quantity_kg"]),
            location=food_data["location"],
            preferences=food_data.get("preferences"),
        )

    # ── event listeners ──

    async def _listen_supply_requests(self) -> None:
        async for event in self.subscribe("prediction.request.supply"):
            payload = event["payload"]
            business_id = payload.get("business_id", "unknown_business")
            history = payload.get("historical_donations", [])
            days = int(payload.get("days", 7))

            forecast = self.forecast_supply_for_business(
                business_id,
                historical_donations=history,
                days=days,
            )
            await self.publish_event(
                "prediction.result.supply",
                {
                    "business_id": business_id,
                    "forecast": forecast,
                    "requested_at": datetime.utcnow().isoformat(),
                },
            )

    async def _listen_demand_requests(self) -> None:
        async for event in self.subscribe("prediction.request.demand"):
            payload = event["payload"]
            household = payload.get("household_data") or {}
            community = payload.get("community_data") or {}
            economic = payload.get("economic_data") or {}

            risk = self.predict_household_demand(
                household_data=household,
                community_data=community,
                economic_data=economic,
            )
            await self.publish_event(
                "prediction.result.demand",
                {
                    "household_id": household.get("id"),
                    "risk_assessment": risk,
                    "requested_at": datetime.utcnow().isoformat(),
                },
            )

    async def _listen_crisis_requests(self) -> None:
        async for event in self.subscribe("prediction.request.crisis"):
            payload = event["payload"]
            sequence = payload.get("recent_prices") or []
            prediction = self.predict_price_crisis(sequence)

            await self.publish_event(
                "prediction.result.crisis",
                {
                    "region": payload.get("region"),
                    "commodity": payload.get("commodity", "all"),
                    "prediction": prediction,
                    "requested_at": datetime.utcnow().isoformat(),
                },
            )

    async def _listen_scenario_requests(self) -> None:
        async for event in self.subscribe("prediction.request.scenario"):
            payload = event["payload"]
            result = self.analyze_scenario(payload)
            await self.publish_event(
                "prediction.result.scenario",
                {
                    "scenario": result["scenario"],
                    "ranked_strategies": result["ranked_strategies"],
                    "best_strategy": result["best_strategy"],
                    "total_potential_meals": result["total_potential_meals"],
                    "requested_at": datetime.utcnow().isoformat(),
                },
            )


async def main() -> None:
    from config import MCP_HOST, MCP_PORT

    agent = PredictionAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())

