"""Pydantic schemas for DocFlow HR API."""

from app.schemas.common import (
    HealthResponse,
    ErrorResponse,
    SuccessResponse,
    PaginatedResponse,
)
from app.schemas.organizations import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationListResponse,
)
from app.schemas.users import (
    UserInviteRequest,
    UserInviteResponse,
    UserActivateRequest,
    UserActivateResponse,
    UserResponse,
    UserListResponse,
)
from app.schemas.employees import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
    EmployeeSearchQuery,
)
from app.schemas.uploads import (
    UploadRequest,
    UploadResponse,
    UploadCompleteRequest,
    UploadCompleteResponse,
    FileMetadata,
)
from app.schemas.review import (
    ReviewQueueItem,
    ReviewQueueResponse,
    ApproveRequest,
    RejectRequest,
    ReviewResponse,
    ReviewStats,
)
from app.schemas.audit import (
    AuditAction,
    AuditEntityType,
    AuditEventCreate,
    AuditEvent,
    AuditEventListResponse,
    AuditEventFilter,
    DocumentAuditTrailResponse,
)
from app.schemas.retention import (
    RetentionPolicyBase,
    RetentionPolicyCreate,
    RetentionPolicy,
    RetentionCalculation,
    RetentionScheduleRequest,
    RetentionScheduleResponse,
)
from app.schemas.legal_hold import (
    LegalHoldScope,
    LegalHoldCreate,
    LegalHold,
    LegalHoldRelease,
    LegalHoldReleaseResponse,
    DocumentLegalHoldStatus,
)

__all__ = [
    # Common
    "HealthResponse",
    "ErrorResponse",
    "SuccessResponse",
    "PaginatedResponse",
    # Organizations
    "OrganizationCreate",
    "OrganizationUpdate",
    "OrganizationResponse",
    "OrganizationListResponse",
    # Users
    "UserInviteRequest",
    "UserInviteResponse",
    "UserActivateRequest",
    "UserActivateResponse",
    "UserResponse",
    "UserListResponse",
    # Employees
    "EmployeeCreate",
    "EmployeeUpdate",
    "EmployeeResponse",
    "EmployeeListResponse",
    "EmployeeSearchQuery",
    # Uploads
    "UploadRequest",
    "UploadResponse",
    "UploadCompleteRequest",
    "UploadCompleteResponse",
    "FileMetadata",
    # Review
    "ReviewQueueItem",
    "ReviewQueueResponse",
    "ApproveRequest",
    "RejectRequest",
    "ReviewResponse",
    "ReviewStats",
    # Audit
    "AuditAction",
    "AuditEntityType",
    "AuditEventCreate",
    "AuditEvent",
    "AuditEventListResponse",
    "AuditEventFilter",
    "DocumentAuditTrailResponse",
    # Retention
    "RetentionPolicyBase",
    "RetentionPolicyCreate",
    "RetentionPolicy",
    "RetentionCalculation",
    "RetentionScheduleRequest",
    "RetentionScheduleResponse",
    # Legal Hold
    "LegalHoldScope",
    "LegalHoldCreate",
    "LegalHold",
    "LegalHoldRelease",
    "LegalHoldReleaseResponse",
    "DocumentLegalHoldStatus",
]
