"""Review workflow schemas for DocFlow HR API."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ReviewQueueItem(BaseModel):
    """Individual item in the review queue."""

    document_id: str = Field(description="Unique identifier of the document")
    employee_name: str = Field(description="Name of the employee who submitted the document")
    employee_id: str = Field(description="ID of the employee who submitted the document")
    document_category: str = Field(description="Category of the document")
    submitted_at: datetime = Field(description="Timestamp when the document was submitted")
    submission_channel: str = Field(description="Channel through which the document was submitted")
    document_name: Optional[str] = Field(default=None, description="Name of the document")
    file_type: Optional[str] = Field(default=None, description="File type/extension")


class ReviewQueueResponse(BaseModel):
    """Paginated response for review queue."""

    items: List[ReviewQueueItem] = Field(description="List of documents pending review")
    total: int = Field(ge=0, description="Total number of documents pending review")
    page: int = Field(ge=1, description="Current page number")
    page_size: int = Field(ge=1, le=100, description="Number of items per page")
    has_next: bool = Field(description="Whether there is a next page")
    has_previous: bool = Field(description="Whether there is a previous page")


class ApproveRequest(BaseModel):
    """Request body for approving a document."""

    notes: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional notes from the reviewer"
    )


class RejectRequest(BaseModel):
    """Request body for rejecting a document."""

    reason: str = Field(
        min_length=1,
        max_length=500,
        description="Reason for rejection"
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional additional notes from the reviewer"
    )


class ReviewResponse(BaseModel):
    """Response after a review action (approve/reject)."""

    document_id: str = Field(description="ID of the reviewed document")
    status: str = Field(description="New status of the document")
    reviewed_by: str = Field(description="ID of the reviewer")
    reviewed_by_name: Optional[str] = Field(default=None, description="Name of the reviewer")
    reviewed_at: datetime = Field(description="Timestamp of the review action")
    notes: Optional[str] = Field(default=None, description="Review notes")
    rejection_reason: Optional[str] = Field(
        default=None,
        description="Reason for rejection (only for rejected documents)"
    )


class ReviewStats(BaseModel):
    """Statistics about the review queue."""

    pending_count: int = Field(ge=0, description="Number of documents pending review")
    approved_today: int = Field(ge=0, description="Number of documents approved today")
    rejected_today: int = Field(ge=0, description="Number of documents rejected today")
