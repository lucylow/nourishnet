"""
Forecasting models for NourishNet.

This package intentionally keeps hard dependencies minimal. Advanced libraries
such as Prophet, scikit‑learn, or XGBoost can be installed optionally; when
they are unavailable the models fall back to simple, explainable heuristics so
the rest of the system keeps working.
"""

