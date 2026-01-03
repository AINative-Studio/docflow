"""Base models for DocFlow HR.

This module provides base Pydantic models with common fields used across
all entity types. These models define the structure for ZeroDB table schemas.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ZeroDBBaseModel(BaseModel):
    """Base model for ZeroDB entities.

    Provides common fields and configuration for all database models.
    All models inherit timestamp tracking and Pydantic v2 configuration.
    """

    class Config:
        """Pydantic model configuration."""
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class TimestampMixin(BaseModel):
    """Mixin for timestamp tracking.

    Provides created_at and updated_at fields for audit purposes.
    These fields are automatically set by the database.
    """

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when record was created (UTC)",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when record was last updated (UTC)",
    )


class OrgScopedMixin(BaseModel):
    """Mixin for multi-tenant organization scoping.

    All entities (except organizations themselves) must be scoped to an
    organization for proper data isolation.

    COMPLIANCE NOTE: Tenant isolation is critical for data privacy.
    All queries must include org_id filter to prevent data leakage.
    """

    org_id: UUID = Field(
        description="Organization ID for multi-tenant isolation",
    )


class SoftDeleteMixin(BaseModel):
    """Mixin for soft delete support.

    Enables logical deletion while preserving data for audit/compliance.
    Soft-deleted records are excluded from normal queries but retained
    for audit trail and potential recovery.

    COMPLIANCE NOTE: Some regulations require retention of deleted records.
    Physical deletion (hard delete) should only occur per retention policy.
    """

    deleted_at: Optional[datetime] = Field(
        default=None,
        description="Timestamp when record was soft-deleted (NULL if active)",
    )
    deleted_by: Optional[UUID] = Field(
        default=None,
        description="User ID who performed soft delete",
    )


class AuditMetadataMixin(BaseModel):
    """Mixin for tracking who created/modified records.

    Provides actor tracking for compliance and audit purposes.
    """

    created_by: UUID = Field(
        description="User ID who created this record",
    )
    updated_by: UUID = Field(
        description="User ID who last updated this record",
    )


def generate_uuid() -> UUID:
    """Generate a new UUID v4.

    Returns:
        A new UUID v4 identifier.
    """
    return uuid4()


class ZeroDBTableSchema(BaseModel):
    """Helper model for defining ZeroDB table schemas.

    This model represents the schema structure expected by ZeroDB's
    table creation API.
    """

    columns: list[Dict[str, Any]] = Field(
        description="List of column definitions",
    )
    indexes: Optional[list[Dict[str, Any]]] = Field(
        default=None,
        description="List of index definitions",
    )

    @staticmethod
    def column_def(
        name: str,
        col_type: str,
        *,
        primary_key: bool = False,
        nullable: bool = True,
        unique: bool = False,
        default: Any = None,
        references: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a column definition.

        Args:
            name: Column name
            col_type: Column type (uuid, text, integer, boolean, timestamp, jsonb, etc.)
            primary_key: Whether this is a primary key column
            nullable: Whether NULL values are allowed
            unique: Whether values must be unique
            default: Default value expression
            references: Foreign key reference (e.g., "organizations(id)")

        Returns:
            Column definition dictionary
        """
        col = {
            "name": name,
            "type": col_type,
            "nullable": nullable,
        }
        if primary_key:
            col["primary_key"] = True
            col["nullable"] = False  # PKs cannot be null
        if unique:
            col["unique"] = True
        if default is not None:
            col["default"] = default
        if references:
            col["references"] = references
        return col

    @staticmethod
    def index_def(
        name: str,
        columns: list[str],
        *,
        unique: bool = False,
        where: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create an index definition.

        Args:
            name: Index name
            columns: List of column names to index
            unique: Whether this is a unique index
            where: Optional WHERE clause for partial index

        Returns:
            Index definition dictionary
        """
        idx = {
            "name": name,
            "columns": columns,
        }
        if unique:
            idx["unique"] = True
        if where:
            idx["where"] = where
        return idx
