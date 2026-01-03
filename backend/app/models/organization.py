"""Organization models for multi-tenant architecture.

Organizations represent tenant companies using DocFlow HR.
All other entities are scoped to an organization for data isolation.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import Field, field_validator

from app.models.base import ZeroDBBaseModel, TimestampMixin, ZeroDBTableSchema


class OrganizationSettings(ZeroDBBaseModel):
    """Organization-level settings and configuration.

    These settings control organization-wide behavior and compliance rules.
    """

    # Document retention defaults
    default_retention_days: int = Field(
        default=2555,  # 7 years, common HR document retention
        description="Default retention period in days for documents without specific policy",
        ge=1,
    )

    # Email intake configuration
    email_intake_enabled: bool = Field(
        default=True,
        description="Whether email-based document intake is enabled",
    )
    email_intake_addresses: list[str] = Field(
        default_factory=list,
        description="Email addresses monitored for document submissions",
    )

    # Auto-approval settings (use with caution)
    auto_approve_documents: bool = Field(
        default=False,
        description="Whether to auto-approve certain document categories (NOT RECOMMENDED for I-9)",
    )
    auto_approve_categories: list[str] = Field(
        default_factory=list,
        description="Document categories eligible for auto-approval if enabled",
    )

    # Notification settings
    notify_on_new_submission: bool = Field(
        default=True,
        description="Send notification to HR when new document submitted",
    )
    notification_email: Optional[str] = Field(
        default=None,
        description="Email address for HR notifications",
    )

    # Employee self-service
    employee_portal_enabled: bool = Field(
        default=True,
        description="Whether employees can access self-service portal",
    )

    # Compliance settings
    require_i9_within_days: int = Field(
        default=3,
        description="Business days to complete I-9 after hire date (USCIS requirement)",
        ge=1,
        le=3,  # USCIS mandates completion within 3 business days
    )

    # Custom fields for organization-specific needs
    custom_fields: Dict[str, Any] = Field(
        default_factory=dict,
        description="Custom organization configuration as JSON",
    )


class Organization(ZeroDBBaseModel, TimestampMixin):
    """Organization (tenant) entity.

    Represents a company/organization using DocFlow HR.
    Provides multi-tenant isolation for all data.

    COMPLIANCE NOTE: Organization data isolation is critical.
    Cross-tenant data access is a serious security/privacy violation.
    """

    id: UUID = Field(
        description="Unique organization identifier (UUID)",
    )

    name: str = Field(
        min_length=1,
        max_length=255,
        description="Organization legal name",
    )

    slug: str = Field(
        min_length=2,
        max_length=100,
        description="URL-safe organization identifier (e.g., 'acme-corp')",
        pattern=r"^[a-z0-9-]+$",
    )

    settings: OrganizationSettings = Field(
        default_factory=OrganizationSettings,
        description="Organization-level settings and configuration",
    )

    # Subscription/billing info
    plan_tier: str = Field(
        default="free",
        description="Subscription plan tier (free, starter, professional, enterprise)",
    )

    is_active: bool = Field(
        default=True,
        description="Whether organization account is active",
    )

    # Contact information
    primary_contact_email: Optional[str] = Field(
        default=None,
        description="Primary contact email for organization",
    )

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """Validate slug is lowercase and URL-safe."""
        if not v.islower():
            raise ValueError("Slug must be lowercase")
        if "--" in v or v.startswith("-") or v.endswith("-"):
            raise ValueError("Slug cannot start/end with hyphen or contain consecutive hyphens")
        return v

    @staticmethod
    def table_schema() -> ZeroDBTableSchema:
        """Get ZeroDB table schema for organizations.

        Returns:
            Table schema definition for ZeroDB
        """
        return ZeroDBTableSchema(
            columns=[
                ZeroDBTableSchema.column_def(
                    "id", "uuid", primary_key=True, default="gen_random_uuid()"
                ),
                ZeroDBTableSchema.column_def(
                    "name", "text", nullable=False
                ),
                ZeroDBTableSchema.column_def(
                    "slug", "text", nullable=False, unique=True
                ),
                ZeroDBTableSchema.column_def(
                    "settings", "jsonb", nullable=False, default="'{}'::jsonb"
                ),
                ZeroDBTableSchema.column_def(
                    "plan_tier", "text", nullable=False, default="'free'"
                ),
                ZeroDBTableSchema.column_def(
                    "is_active", "boolean", nullable=False, default="true"
                ),
                ZeroDBTableSchema.column_def(
                    "primary_contact_email", "text", nullable=True
                ),
                ZeroDBTableSchema.column_def(
                    "created_at", "timestamp", nullable=False, default="now()"
                ),
                ZeroDBTableSchema.column_def(
                    "updated_at", "timestamp", nullable=False, default="now()"
                ),
            ],
            indexes=[
                ZeroDBTableSchema.index_def(
                    "idx_organizations_slug", ["slug"], unique=True
                ),
                ZeroDBTableSchema.index_def(
                    "idx_organizations_active", ["is_active"]
                ),
            ],
        )
