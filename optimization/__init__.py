"""
Optimization and scenario‑analysis utilities for NourishNet.

This package currently exposes:
- ScenarioAnalysisEngine: ranks diversion strategies (donation, composting, etc.)
  using a transparent multi‑criteria scoring model.

The implementation is intentionally lightweight and dependency‑free so it can be
used in both the FastAPI backend and long‑running agents.
"""

