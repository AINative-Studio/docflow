"""Pydantic schemas for DocFlow HR API."""

from app.schemas.common import (
    HealthResponse,
    ErrorResponse,
    SuccessResponse,
    PaginatedResponse,
)

__all__ = [
    "HealthResponse",
    "ErrorResponse",
    "SuccessResponse",
    "PaginatedResponse",
]
