from __future__ import annotations

import datetime as dt
import logging
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Sequence


logger = logging.getLogger(__name__)

try:  # Optional dependency – used when available.
    from prophet import Prophet  # type: ignore

    _HAS_PROPHET = True
except Exception:  # pragma: no cover - gracefully degrade
    Prophet = None  # type: ignore
    _HAS_PROPHET = False
    logger.info("Prophet not installed; SupplyForecastModel will use heuristic mode.")


@dataclass
class SupplyForecastPoint:
    date: dt.date
    predicted: float
    lower: float
    upper: float
    confidence: float


class SupplyForecastModel:
    """
    Predicts future food surplus availability for a single business.

    When Prophet is installed, this wraps a Prophet model with external
    regressors. When not, it falls back to a simple moving‑average forecast with
    seasonality over day‑of‑week.
    """

    def __init__(self, business_id: Optional[str] = None) -> None:
        self.business_id = business_id
        self.model: Any = None

    # ── heuristic fallback implementation ──

    def _heuristic_forecast(
        self,
        historical_donations: Sequence[Dict[str, Any]],
        days: int,
    ) -> List[SupplyForecastPoint]:
        if not historical_donations:
            today = dt.date.today()
            return [
                SupplyForecastPoint(
                    date=today + dt.timedelta(days=i),
                    predicted=0.0,
                    lower=0.0,
                    upper=0.0,
                    confidence=50.0,
                )
                for i in range(days)
            ]

        # Group by weekday to capture a crude weekly pattern.
        totals_by_dow: Dict[int, List[float]] = {i: [] for i in range(7)}
        for row in historical_donations:
            qty = float(row.get("quantity", 0.0))
            d = row.get("date")
            if isinstance(d, str):
                d = dt.datetime.fromisoformat(d).date()
            if not isinstance(d, dt.date):
                continue
            totals_by_dow[d.weekday()].append(qty)

        avg_by_dow: Dict[int, float] = {}
        for dow, values in totals_by_dow.items():
            if values:
                avg_by_dow[dow] = sum(values) / len(values)
            else:
                # fall back to global mean
                all_vals: List[float] = [
                    float(r.get("quantity", 0.0)) for r in historical_donations
                ]
                avg_by_dow[dow] = sum(all_vals) / max(len(all_vals), 1)

        today = dt.date.today()
        points: List[SupplyForecastPoint] = []
        for offset in range(days):
            d = today + dt.timedelta(days=offset)
            base = avg_by_dow.get(d.weekday(), 0.0)
            # Simple uncertainty band: ±30 %
            lower = max(base * 0.7, 0.0)
            upper = base * 1.3
            confidence = 70.0  # static, keeps the API simple
            points.append(
                SupplyForecastPoint(
                    date=d,
                    predicted=base,
                    lower=lower,
                    upper=upper,
                    confidence=confidence,
                )
            )
        return points

    # ── public API ──

    def forecast(
        self,
        *,
        days: int = 7,
        historical_donations: Optional[Iterable[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Generate a supply forecast for the next N days.

        The return format is tailored for the frontend prediction dashboard:

        {
          "points": [
            {"date": "2026-03-03", "predicted": 12.3, "lower": 10.1,
             "upper": 14.0, "confidence": 80.0},
            ...
          ],
          "total_predicted_kg": 123.4,
          "confidence": 78.9
        }
        """
        donations_seq: Sequence[Dict[str, Any]] = list(historical_donations or [])

        if _HAS_PROPHET and self.model is not None:  # pragma: no cover - optional
            # When a trained Prophet model exists, delegate to it.
            future = self.model.make_future_dataframe(periods=days)
            forecast_df = self.model.predict(future).tail(days)
            points = [
                SupplyForecastPoint(
                    date=row["ds"].date(),
                    predicted=float(row["yhat"]),
                    lower=float(row["yhat_lower"]),
                    upper=float(row["yhat_upper"]),
                    confidence=80.0,
                )
                for _, row in forecast_df.iterrows()
            ]
        else:
            points = self._heuristic_forecast(donations_seq, days)

        total = sum(p.predicted for p in points)
        overall_conf = sum(p.confidence for p in points) / max(len(points), 1)

        return {
            "points": [
                {
                    "date": p.date.isoformat(),
                    "predicted": p.predicted,
                    "lower": p.lower,
                    "upper": p.upper,
                    "confidence": p.confidence,
                }
                for p in points
            ],
            "total_predicted_kg": total,
            "confidence": overall_conf,
        }


