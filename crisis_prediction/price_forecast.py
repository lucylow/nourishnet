from __future__ import annotations

import logging
import math
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Sequence


logger = logging.getLogger(__name__)


@dataclass
class PriceCrisisOutcome:
    predicted_price: float
    price_change_percent: float
    volatility_index: float
    crisis_probability: float
    crisis_level: str
    days_to_crisis: int | None


class PriceCrisisPredictor:
    """
    Heuristic predictor for food‑price crises.

    The interface mirrors a potential deep‑learning LSTM model but uses
    lightweight statistics so no GPU / torch dependency is required by default.
    """

    def __init__(self) -> None:
        # Thresholds tuned for simple demos, loosely inspired by IPC phases.
        self.stress_threshold = 5.0
        self.emergency_threshold = 15.0
        self.crisis_threshold = 30.0

    def _volatility(self, prices: Sequence[float]) -> float:
        if len(prices) < 2:
            return 0.0
        returns = [(prices[i + 1] - prices[i]) / max(prices[i], 1e-6) for i in range(len(prices) - 1)]
        mean = sum(returns) / len(returns)
        var = sum((r - mean) ** 2 for r in returns) / max(len(returns) - 1, 1)
        return math.sqrt(var)

    def _baseline_response(self) -> Dict[str, Any]:
        return {
            "predicted_price": 0.0,
            "price_change_percent": 0.0,
            "volatility_index": 0.0,
            "crisis_probability": 5.0,
            "crisis_level": "MINIMAL",
            "days_to_crisis": None,
            "recommended_actions": self._get_recommendations("MINIMAL"),
        }

    def predict_price_crisis(self, recent_sequence: Iterable[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict crisis probability from a recent sequence of price points.

        `recent_sequence` is an iterable of dict‑like objects with at least a
        `"price"` key. Invalid or missing prices are skipped; if no valid data
        is found a safe baseline `"MINIMAL"` prediction is returned instead.
        """
        seq: List[Dict[str, Any]] = list(recent_sequence or [])
        if not seq:
            return self._baseline_response()

        try:
            prices: List[float] = []
            for idx, row in enumerate(seq):
                if not isinstance(row, Mapping):
                    logger.warning(
                        "Skipping non‑mapping price row at index=%s: %r", idx, row
                    )
                    continue

                raw_price = row.get("price")
                try:
                    price_val = float(raw_price)
                except (TypeError, ValueError):
                    logger.warning(
                        "Skipping price point with invalid 'price' at index=%s: %r",
                        idx,
                        raw_price,
                    )
                    continue

                if price_val < 0:
                    logger.warning(
                        "Skipping negative price value at index=%s: %s",
                        idx,
                        price_val,
                    )
                    continue

                prices.append(price_val)

            if not prices:
                logger.error(
                    "No valid price points found in recent_sequence; "
                    "returning baseline MINIMAL prediction."
                )
                return self._baseline_response()

            current_price = prices[-1]
            history = prices[:-1] or prices
            historical_mean = sum(history) / max(len(history), 1)

            # Extrapolate one step ahead using a simple momentum term.
            if len(prices) >= 2:
                last_return = (prices[-1] - prices[-2]) / max(prices[-2], 1e-6)
            else:
                last_return = 0.0
            predicted_price = current_price * (1.0 + last_return)

            price_change_pct = (
                ((predicted_price - historical_mean) / max(historical_mean, 1e-6))
                * 100.0
            )
            vol = self._volatility(prices)

            if price_change_pct > self.crisis_threshold:
                crisis_level = "CRISIS"
                probability = min(95.0, 60.0 + price_change_pct / 2.0)
                days_to_crisis = 10
            elif price_change_pct > self.emergency_threshold:
                crisis_level = "EMERGENCY"
                probability = min(85.0, 40.0 + price_change_pct / 2.0)
                days_to_crisis = 20
            elif price_change_pct > self.stress_threshold:
                crisis_level = "STRESS"
                probability = min(65.0, 20.0 + price_change_pct / 2.0)
                days_to_crisis = 30
            else:
                crisis_level = "MINIMAL"
                probability = max(5.0, 10.0 - price_change_pct / 2.0)
                days_to_crisis = None

            return {
                "predicted_price": round(predicted_price, 2),
                "price_change_percent": round(price_change_pct, 2),
                "volatility_index": round(vol, 4),
                "crisis_probability": round(probability, 1),
                "crisis_level": crisis_level,
                "days_to_crisis": days_to_crisis,
                "recommended_actions": self._get_recommendations(crisis_level),
            }
        except Exception:
            logger.exception(
                "Unexpected error during price crisis prediction; "
                "returning baseline MINIMAL prediction."
            )
            return self._baseline_response()

    def _get_recommendations(self, crisis_level: str) -> List[str]:
        recs = {
            "CRISIS": [
                "Activate emergency food reserves",
                "Coordinate with local authorities for mass distribution",
                "Mobilise all available volunteers",
                "Request government assistance",
            ],
            "EMERGENCY": [
                "Increase food bank opening hours",
                "Pre‑position supplies in affected areas",
                "Alert partner organisations",
                "Prepare emergency communications",
            ],
            "STRESS": [
                "Monitor vulnerable households closely",
                "Increase outreach efforts",
                "Stockpile non‑perishable items",
            ],
            "MINIMAL": [
                "Continue normal operations",
                "Maintain regular monitoring",
            ],
        }
        return recs.get(crisis_level, recs["MINIMAL"])


