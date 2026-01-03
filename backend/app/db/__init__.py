"""Database connectivity for DocFlow HR.

This module provides the ZeroDB client and related utilities for
database operations throughout the application.
"""

from app.db.zerodb_client import (
    ZeroDBClient,
    close_zerodb_client,
    get_zerodb_client,
    init_zerodb_client,
    zerodb_client_context,
)

__all__ = [
    "ZeroDBClient",
    "get_zerodb_client",
    "init_zerodb_client",
    "close_zerodb_client",
    "zerodb_client_context",
]
