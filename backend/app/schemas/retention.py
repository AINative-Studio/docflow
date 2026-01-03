"""Retention policy schemas for DocFlow HR.

Retention policies define how long employee documents must be retained after
termination, based on state-specific legal requirements. These policies ensure
compliance with state record retention laws while enabling automated cleanup
of outdated records.
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class RetentionPolicyBase(BaseModel):
    """Base retention policy schema."""

    state_code: str = Field(
        ...,
        description="Two-letter state code (e.g., FL, TX, AZ)",
        min_length=2,
        max_length=2,
    )
    document_category: str = Field(
        ...,
        description="Document category this policy applies to",
    )
    retention_days: int = Field(
        ...,
        description="Number of days to retain documents after termination",
        ge=0,
    )


class RetentionPolicyCreate(RetentionPolicyBase):
    """Schema for creating a retention policy."""

    pass


class RetentionPolicy(RetentionPolicyBase):
    """Retention policy with metadata."""

    id: str = Field(..., description="Unique policy identifier")
    org_id: str = Field(..., description="Organization identifier")
    created_at: datetime = Field(..., description="Policy creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    created_by: str = Field(..., description="User who created the policy")

    model_config = {"from_attributes": True}


class RetentionCalculationRequest(BaseModel):
    """Request schema for retention date calculation."""

    employee_id: str = Field(..., description="Employee identifier")
    document_id: str = Field(..., description="Document identifier")


class RetentionCalculation(BaseModel):
    """Retention calculation result.

    This schema provides the calculated deletion date for a document based on:
    - Employee's state of work
    - Document category retention policy
    - Employee termination date
    - Active legal holds
    """

    document_id: str = Field(..., description="Document identifier")
    employee_id: str = Field(..., description="Employee identifier")
    state_code: str = Field(..., description="Employee's state of work")
    retention_days: int = Field(
        ...,
        description="Number of days from termination to retain document",
    )
    termination_date: Optional[date] = Field(
        None,
        description="Employee termination date (null if still active)",
    )
    deletion_scheduled_at: Optional[datetime] = Field(
        None,
        description="Calculated deletion timestamp (null if employee active or under legal hold)",
    )
    under_legal_hold: bool = Field(
        ...,
        description="Whether document is currently under legal hold (blocks deletion)",
    )
    legal_hold_count: int = Field(
        default=0,
        description="Number of active legal holds affecting this document",
    )


class RetentionScheduleRequest(BaseModel):
    """Request schema for scheduling document deletion."""

    document_id: str = Field(..., description="Document identifier")
    deletion_scheduled_at: datetime = Field(
        ...,
        description="Timestamp when document should be deleted",
    )
    reason: Optional[str] = Field(
        None,
        description="Business justification for scheduling deletion",
    )


class RetentionScheduleResponse(BaseModel):
    """Response schema for scheduled deletion."""

    document_id: str = Field(..., description="Document identifier")
    deletion_scheduled_at: datetime = Field(
        ...,
        description="Scheduled deletion timestamp",
    )
    under_legal_hold: bool = Field(
        ...,
        description="Whether document is under legal hold",
    )
    scheduled_by: str = Field(..., description="User who scheduled the deletion")
    scheduled_at: datetime = Field(..., description="When the scheduling occurred")
    message: str = Field(..., description="Status message")
