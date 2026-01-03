"""Data models for DocFlow HR."""

from app.models.enums import (
    UserStatus,
    EmploymentStatus,
    DocumentCategory,
    DocumentStatus,
    SubmissionChannel,
    SubmissionStatus,
    AuditAction,
    AuditEntityType,
    LegalHoldStatus,
    LegalHoldScopeType,
    RoleType,
    USState,
)
from app.models.base import (
    ZeroDBBaseModel,
    TimestampMixin,
    OrgScopedMixin,
    SoftDeleteMixin,
    AuditMetadataMixin,
    ZeroDBTableSchema,
)
from app.models.organization import Organization, OrganizationSettings
from app.models.user import Permission, Role, User

__all__ = [
    # Enums
    "UserStatus",
    "EmploymentStatus",
    "DocumentCategory",
    "DocumentStatus",
    "SubmissionChannel",
    "SubmissionStatus",
    "AuditAction",
    "AuditEntityType",
    "LegalHoldStatus",
    "LegalHoldScopeType",
    "RoleType",
    "USState",
    # Base classes
    "ZeroDBBaseModel",
    "TimestampMixin",
    "OrgScopedMixin",
    "SoftDeleteMixin",
    "AuditMetadataMixin",
    "ZeroDBTableSchema",
    # Models
    "Organization",
    "OrganizationSettings",
    "Permission",
    "Role",
    "User",
]
