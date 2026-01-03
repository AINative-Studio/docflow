"""Common response schemas for DocFlow HR API."""

from datetime import datetime
from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(default="healthy", description="Health status")
    version: str = Field(description="Application version")
    environment: str = Field(description="Current environment")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Response timestamp"
    )


class ErrorDetail(BaseModel):
    """Error detail schema."""

    field: Optional[str] = Field(default=None, description="Field that caused the error")
    message: str = Field(description="Error message")
    code: Optional[str] = Field(default=None, description="Error code")


class ErrorResponse(BaseModel):
    """Standard error response schema."""

    success: bool = Field(default=False, description="Success status")
    error: str = Field(description="Error type")
    message: str = Field(description="Human-readable error message")
    details: Optional[List[ErrorDetail]] = Field(
        default=None, description="Detailed error information"
    )
    request_id: Optional[str] = Field(
        default=None, description="Request ID for tracking"
    )


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success response schema."""

    success: bool = Field(default=True, description="Success status")
    message: Optional[str] = Field(default=None, description="Success message")
    data: Optional[T] = Field(default=None, description="Response data")


class PaginationMeta(BaseModel):
    """Pagination metadata schema."""

    page: int = Field(ge=1, description="Current page number")
    page_size: int = Field(ge=1, le=100, description="Items per page")
    total_items: int = Field(ge=0, description="Total number of items")
    total_pages: int = Field(ge=0, description="Total number of pages")
    has_next: bool = Field(description="Whether there is a next page")
    has_previous: bool = Field(description="Whether there is a previous page")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response schema."""

    success: bool = Field(default=True, description="Success status")
    data: List[T] = Field(description="List of items")
    pagination: PaginationMeta = Field(description="Pagination metadata")
