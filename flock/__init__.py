"""
FLock API integration for NourishNet.

This package exposes an async client used by agents to call
open-source models hosted behind the FLock API.

At runtime we can switch between the real FLock client and a mock
implementation by toggling the USE_MOCK_FLOCK environment variable.
"""

from config import USE_MOCK_FLOCK

if USE_MOCK_FLOCK:
    # Local dev / demo mode: no real network calls.
    from .mock_client import flock_inference  # noqa: F401
else:
    # Default: use real FLock API.
    from .client import flock_inference  # noqa: F401
