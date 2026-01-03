"""Legal hold schemas for DocFlow HR.

Legal holds prevent document deletion during litigation, investigations, or audits.
When a legal hold is placed, all affected documents are preserved indefinitely
until the hold is released by authorized personnel (Legal or HR Admin roles).

Legal holds take precedence over retention policies - documents under hold cannot
be deleted even if their retention period has expired.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class LegalHoldScope(BaseModel):
    """Legal hold scope definition."""

    scope_type: Literal["employee", "department", "document_category", "date_range"] = Field(
        ...,
        description="Type of scope: employee (specific person), department (entire dept), "
        "document_category (all docs of a type), or date_range (docs created in period)",
    )
    scope_value: str = Field(
        ...,
        description="Value for the scope - employee_id, department name, category name, "
        "or ISO date range (e.g., '2023-01-01:2023-12-31')",
    )


class LegalHoldCreate(BaseModel):
    """Request schema for creating a legal hold.

    Legal holds should only be created by Legal or HR Admin roles.
    Reason field should document the legal/compliance basis for the hold
    (e.g., 'Smith v. Company ABC litigation', 'EEOC investigation #12345').
    """

    name: str = Field(
        ...,
        description="Descriptive name for the legal hold (e.g., 'Smith Litigation 2024')",
        min_length=3,
        max_length=200,
    )
    scope_type: Literal["employee", "department", "document_category", "date_range"] = Field(
        ...,
        description="Scope type determining which documents are affected",
    )
    scope_value: str = Field(
        ...,
        description="Specific value for the scope type",
        min_length=1,
    )
    reason: Optional[str] = Field(
        None,
        description="Legal/compliance reason for the hold (required for audit trail)",
        max_length=1000,
    )


class LegalHoldUpdate(BaseModel):
    """Schema for updating legal hold metadata.

    Note: Scope cannot be changed after creation. To modify scope,
    release the existing hold and create a new one.
    """

    name: Optional[str] = Field(
        None,
        description="Updated descriptive name",
        min_length=3,
        max_length=200,
    )
    reason: Optional[str] = Field(
        None,
        description="Updated reason for the hold",
        max_length=1000,
    )


class LegalHold(BaseModel):
    """Legal hold with full metadata.

    Active holds prevent deletion of all documents matching the scope criteria.
    Released holds are kept for audit trail but no longer block deletions.
    """

    id: str = Field(..., description="Unique legal hold identifier")
    org_id: str = Field(..., description="Organization identifier")
    name: str = Field(..., description="Descriptive name of the legal hold")
    scope_type: str = Field(..., description="Type of scope applied")
    scope_value: str = Field(..., description="Specific scope value")
    reason: Optional[str] = Field(None, description="Legal/compliance reason")
    status: Literal["active", "released"] = Field(
        ...,
        description="Hold status: active (blocking deletions) or released (historical record)",
    )
    created_by: str = Field(..., description="User who created the hold")
    created_at: datetime = Field(..., description="Hold creation timestamp")
    released_by: Optional[str] = Field(None, description="User who released the hold")
    released_at: Optional[datetime] = Field(None, description="Hold release timestamp")
    affected_document_count: int = Field(
        default=0,
        description="Number of documents currently affected by this hold",
    )

    model_config = {"from_attributes": True}


class LegalHoldRelease(BaseModel):
    """Request schema for releasing a legal hold.

    Releasing a hold allows retention policies to resume for affected documents.
    Only Legal or HR Admin roles can release holds.
    """

    reason: Optional[str] = Field(
        None,
        description="Reason for releasing the hold (e.g., 'Case dismissed', 'Investigation closed')",
        max_length=500,
    )


class LegalHoldReleaseResponse(BaseModel):
    """Response schema for legal hold release."""

    legal_hold_id: str = Field(..., description="Released legal hold identifier")
    name: str = Field(..., description="Name of the released hold")
    status: str = Field(..., description="New status (should be 'released')")
    released_by: str = Field(..., description="User who released the hold")
    released_at: datetime = Field(..., description="Release timestamp")
    affected_documents: int = Field(
        ...,
        description="Number of documents that were under this hold",
    )
    message: str = Field(..., description="Status message")


class DocumentLegalHoldStatus(BaseModel):
    """Schema for document's legal hold status.

    Used to check whether a document can be deleted and which holds
    are currently protecting it.
    """

    document_id: str = Field(..., description="Document identifier")
    under_legal_hold: bool = Field(
        ...,
        description="Whether document is currently under any legal hold",
    )
    active_holds: list[LegalHold] = Field(
        default_factory=list,
        description="List of active legal holds affecting this document",
    )
    can_be_deleted: bool = Field(
        ...,
        description="Whether document can be deleted (false if under hold)",
    )
