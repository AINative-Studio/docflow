"""Pydantic schemas for Audit & Events system."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AuditAction(str, Enum):
    """Supported audit event action types."""

    # Document events
    DOCUMENT_RECEIVED = "document.received"
    DOCUMENT_VERSION_CREATED = "document.version.created"
    DOCUMENT_REVIEW_APPROVED = "document.review.approved"
    DOCUMENT_REVIEW_REJECTED = "document.review.rejected"

    # Employee events
    EMPLOYEE_CREATED = "employee.created"
    EMPLOYEE_UPDATED = "employee.updated"

    # Legal hold events
    LEGAL_HOLD_CREATED = "legal_hold.created"
    LEGAL_HOLD_RELEASED = "legal_hold.released"


class AuditEntityType(str, Enum):
    """Supported audit entity types."""

    DOCUMENT = "document"
    EMPLOYEE = "employee"
    LEGAL_HOLD = "legal_hold"


class AuditEventCreate(BaseModel):
    """Schema for creating an audit event."""

    entity_type: str = Field(
        ...,
        description="Type of entity being audited (e.g., document, employee, legal_hold)",
        examples=["document", "employee", "legal_hold"],
    )
    entity_id: str = Field(
        ...,
        description="Unique identifier of the entity",
        examples=["doc-123", "emp-456"],
    )
    action: str = Field(
        ...,
        description="Action performed on the entity",
        examples=["document.received", "employee.created"],
    )
    actor_id: str = Field(
        ...,
        description="ID of the user or system performing the action",
        examples=["user-789", "system"],
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional context and details about the event",
        examples=[{"previous_version": "1.0", "new_version": "1.1"}],
    )


class AuditEvent(BaseModel):
    """Schema for an audit event response."""

    id: str = Field(
        ...,
        description="Unique identifier for the audit event",
    )
    org_id: str = Field(
        ...,
        description="Organization ID the event belongs to",
    )
    entity_type: str = Field(
        ...,
        description="Type of entity being audited",
    )
    entity_id: str = Field(
        ...,
        description="Unique identifier of the entity",
    )
    action: str = Field(
        ...,
        description="Action performed on the entity",
    )
    actor_id: str = Field(
        ...,
        description="ID of the user or system performing the action",
    )
    actor_email: Optional[str] = Field(
        default=None,
        description="Email of the actor (if available)",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional context and details about the event",
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the event was created",
    )

    class Config:
        """Pydantic model configuration."""

        from_attributes = True


class AuditEventListResponse(BaseModel):
    """Paginated response for audit events list."""

    events: List[AuditEvent] = Field(
        ...,
        description="List of audit events",
    )
    total: int = Field(
        ...,
        ge=0,
        description="Total number of events matching the query",
    )
    page: int = Field(
        ...,
        ge=1,
        description="Current page number",
    )
    page_size: int = Field(
        ...,
        ge=1,
        le=100,
        description="Number of items per page",
    )


class AuditEventFilter(BaseModel):
    """Filter parameters for querying audit events."""

    entity_type: Optional[str] = Field(
        default=None,
        description="Filter by entity type",
    )
    entity_id: Optional[str] = Field(
        default=None,
        description="Filter by entity ID",
    )
    action: Optional[str] = Field(
        default=None,
        description="Filter by action type",
    )
    actor_id: Optional[str] = Field(
        default=None,
        description="Filter by actor ID",
    )
    start_date: Optional[datetime] = Field(
        default=None,
        description="Filter events created after this date",
    )
    end_date: Optional[datetime] = Field(
        default=None,
        description="Filter events created before this date",
    )


class DocumentAuditTrailResponse(BaseModel):
    """Response for document-specific audit trail."""

    document_id: str = Field(
        ...,
        description="ID of the document",
    )
    events: List[AuditEvent] = Field(
        ...,
        description="List of audit events for this document in chronological order",
    )
    total_events: int = Field(
        ...,
        ge=0,
        description="Total number of events for this document",
    )
