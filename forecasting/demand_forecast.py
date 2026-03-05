from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class DemandRiskAssessment:
    risk_score: int
    risk_level: str
    priority: int
    confidence: int


class FoodInsecurityPredictor:
    """
    Lightweight, interpretable predictor for household food‑insecurity risk.

    This is intentionally rule‑based so it works without heavy ML libraries,
    while keeping the API compatible with a future RandomForest implementation.
    """

    def __init__(self) -> None:
        # Tunable weights; positive values increase risk, negative decrease.
        self.weights: Dict[str, float] = {
            "household_size": 4.0,
            "has_children": 6.0,
            "has_elderly": 3.0,
            "employment_unemployed": 10.0,
            "employment_unstable": 6.0,
            "housing_unstable": 8.0,
            "far_from_food_bank": 5.0,
            "high_price_index": 7.0,
            "high_volatility": 5.0,
            "high_unemployment": 8.0,
            "high_inflation": 6.0,
            "high_benefit_claims": 4.0,
        }

    def _score(
        self,
        household_data: Dict[str, Any],
        community_data: Dict[str, Any],
        economic_data: Dict[str, Any],
    ) -> float:
        score = 0.0

        size = int(household_data.get("size", 1))
        score += self.weights["household_size"] * max(size - 1, 0)

        if bool(household_data.get("children", False)):
            score += self.weights["has_children"]
        if bool(household_data.get("elderly", False)):
            score += self.weights["has_elderly"]

        employment = str(household_data.get("employment", "stable"))
        if employment == "unemployed":
            score += self.weights["employment_unemployed"]
        elif employment == "unstable":
            score += self.weights["employment_unstable"]

        housing = str(household_data.get("housing", "stable"))
        if housing in {"temporary", "unstable", "homeless"}:
            score += self.weights["housing_unstable"]

        dist = float(community_data.get("food_bank_distance", 10.0))
        if dist > 3.0:
            score += self.weights["far_from_food_bank"] * (dist - 3.0) / 5.0

        price_index = float(community_data.get("price_index", 100.0))
        if price_index > 110:
            score += self.weights["high_price_index"] * (price_index - 110) / 50.0

        volatility = float(community_data.get("price_volatility", 5.0))
        if volatility > 10:
            score += self.weights["high_volatility"] * (volatility - 10) / 20.0

        unemployment = float(economic_data.get("unemployment", 5.0))
        if unemployment > 6.0:
            score += self.weights["high_unemployment"] * (unemployment - 6.0) / 10.0

        inflation = float(economic_data.get("inflation", 2.0))
        if inflation > 3.0:
            score += self.weights["high_inflation"] * (inflation - 3.0) / 7.0

        benefits = float(economic_data.get("benefit_claims", 10.0))
        if benefits > 15.0:
            score += self.weights["high_benefit_claims"] * (benefits - 15.0) / 30.0

        # Squash into a 0‑100 band.
        return max(0.0, min(score, 100.0))

    def predict_risk(
        self,
        *,
        household_data: Dict[str, Any],
        community_data: Dict[str, Any],
        economic_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Predict probability of a household needing food assistance.

        Returns:
        {
          "risk_score": 0‑100,
          "risk_level": "LOW" | "MEDIUM" | "HIGH",
          "priority": 1‑3,
          "confidence": 0‑100
        }
        """
        raw_score = self._score(household_data, community_data, economic_data)
        proba = raw_score / 100.0

        if proba >= 0.7:
            risk_level = "HIGH"
            priority = 1
        elif proba >= 0.4:
            risk_level = "MEDIUM"
            priority = 2
        else:
            risk_level = "LOW"
            priority = 3

        # Confidence is higher when the score is far from the mid‑band.
        confidence = int(abs(proba - 0.5) * 200)

        return {
            "risk_score": int(raw_score),
            "risk_level": risk_level,
            "priority": priority,
            "confidence": confidence,
        }


