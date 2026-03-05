from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class ScenarioPreferences:
    """
    Simple container for scenario‑analysis weights.

    All weights should sum (approximately) to 1.0. In practice we normalise, so
    callers can pass any non‑negative numbers.
    """

    meals: float = 0.5
    ghg: float = 0.3
    cost: float = 0.2

    @classmethod
    def from_dict(cls, data: Optional[Dict[str, Any]]) -> "ScenarioPreferences":
        if not data:
            return cls()
        weights = (data or {}).get("weights") or {}
        return cls(
            meals=float(weights.get("meals", 0.5)),
            ghg=float(weights.get("ghg", 0.3)),
            cost=float(weights.get("cost", 0.2)),
        )

    def as_normalised(self) -> "ScenarioPreferences":
        total = max(self.meals + self.ghg + self.cost, 1e-6)
        return ScenarioPreferences(
            meals=self.meals / total,
            ghg=self.ghg / total,
            cost=self.cost / total,
        )


class ScenarioAnalysisEngine:
    """
    Predicts and ranks food diversion strategies based on multiple criteria.

    Inspired by the University of Maryland NourishNet project, this simplified
    engine trades exact academic parameters for a transparent, easy‑to‑tune
    scoring model that works well for demos and early pilots.
    """

    def __init__(self) -> None:
        # Supported diversion strategies (kept close to the spec in the brief).
        self.strategies: List[str] = [
            "donation_to_food_bank",
            "donation_to_community_kitchen",
            "composting",
            "anaerobic_digestion",
            "animal_feed",
            "landfill",
        ]

        # Impact coefficients (kg CO₂‑e / kg food).
        # Numbers are illustrative and should be refined against real data.
        self.coefficients: Dict[str, Dict[str, float]] = {
            "greenhouse_gas_kg_per_kg": {
                "donation_to_food_bank": 0.1,
                "donation_to_community_kitchen": 0.15,
                "composting": 0.3,
                "anaerobic_digestion": 0.2,
                "animal_feed": 0.25,
                "landfill": 2.5,
            },
            "cost_per_kg_gbp": {
                "donation_to_food_bank": 0.5,
                "donation_to_community_kitchen": 0.6,
                "composting": 0.8,
                "anaerobic_digestion": 1.2,
                "animal_feed": 0.4,
                "landfill": 1.5,
            },
            "meals_per_kg": {
                "donation_to_food_bank": 2.5,
                "donation_to_community_kitchen": 2.2,
                "composting": 0.0,
                "anaerobic_digestion": 0.0,
                "animal_feed": 0.0,
                "landfill": 0.0,
            },
        }

    def analyze_scenario(
        self,
        food_type: str,
        quantity_kg: float,
        location: str,
        preferences: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Rank diversion strategies for specific food surplus.

        Returns a dict containing:
        - scenario: high‑level description of the surplus
        - ranked_strategies: per‑strategy metrics and composite score
        - best_strategy: human‑readable name of the top strategy
        - total_potential_meals: sum of all edible‑path meals
        """
        prefs = ScenarioPreferences.from_dict(preferences).as_normalised()

        results: List[Dict[str, Any]] = []
        for strategy in self.strategies:
            ghg = quantity_kg * self.coefficients["greenhouse_gas_kg_per_kg"][strategy]
            cost = quantity_kg * self.coefficients["cost_per_kg_gbp"][strategy]
            meals = quantity_kg * self.coefficients["meals_per_kg"][strategy]

            nearest_facility = self._find_nearest_facility(strategy, location)
            distance_km = nearest_facility.get("distance", 5.0) if nearest_facility else None

            score = self._calculate_score(
                ghg=ghg,
                cost=cost,
                meals=meals,
                prefs=prefs,
            )

            results.append(
                {
                    "strategy": strategy.replace("_", " ").title(),
                    "greenhouse_gas_kg": round(ghg, 2),
                    "cost_gbp": round(cost, 2),
                    "meals_provided": int(meals),
                    "distance_km": round(distance_km, 1) if distance_km is not None else None,
                    "nearest_facility": nearest_facility,
                    "score": round(score, 2),
                    "recommendation_rank": None,  # populated after sorting
                }
            )

        # Sort by score descending and add ranks / badges.
        results.sort(key=lambda x: x["score"], reverse=True)
        for idx, r in enumerate(results):
            r["recommendation_rank"] = idx + 1
            r["badge"] = (
                "RECOMMENDED"
                if idx == 0
                else "Alternative"
                if idx < 3
                else "Option"
            )

        total_meals = int(sum(r["meals_provided"] for r in results if r["meals_provided"] > 0))

        return {
            "scenario": {
                "food_type": food_type,
                "quantity_kg": quantity_kg,
                "location": location,
            },
            "ranked_strategies": results,
            "best_strategy": results[0]["strategy"] if results else None,
            "total_potential_meals": total_meals,
        }

    def _find_nearest_facility(self, strategy_type: str, location: str) -> Dict[str, Any]:
        """
        Placeholder for facility lookup.

        In production this would integrate with a mapping / places API. For now
        we return a small hard‑coded set that works across demos and tests.
        """
        facilities: Dict[str, Dict[str, Any]] = {
            "donation_to_food_bank": {"name": "Local Food Bank", "distance": 2.3},
            "donation_to_community_kitchen": {"name": "Community Kitchen", "distance": 1.8},
            "composting": {"name": "Green Waste Facility", "distance": 4.5},
        }
        return facilities.get(strategy_type, {"name": f"Nearest facility to {location}", "distance": 5.0})

    def _calculate_score(
        self,
        *,
        ghg: float,
        cost: float,
        meals: float,
        prefs: ScenarioPreferences,
    ) -> float:
        """
        Composite score in range [0, 100] combining:
        - Meals provided (higher is better)
        - GHG emissions (lower is better)
        - Cost (lower is better)
        """
        # Simple min‑max style normalisation using soft caps suitable for demos.
        max_meals = 100.0
        max_ghg = 100.0
        max_cost = 100.0

        meals_score = min(max(meals / max_meals, 0.0), 1.0) if max_meals > 0 else 0.0
        ghg_score = 1.0 - min(max(ghg / max_ghg, 0.0), 1.0) if max_ghg > 0 else 0.0
        cost_score = 1.0 - min(max(cost / max_cost, 0.0), 1.0) if max_cost > 0 else 0.0

        total = (
            prefs.meals * meals_score
            + prefs.ghg * ghg_score
            + prefs.cost * cost_score
        )
        return total * 100.0


