"""Enumeration types for DocFlow HR models.

This module defines all enum types used across the application to ensure
consistency and type safety. Enums are used for status fields, categories,
and other controlled vocabularies.
"""

from enum import Enum


class UserStatus(str, Enum):
    """User account status.

    Controls user access to the system:
    - ACTIVE: User can log in and access system
    - INACTIVE: User account disabled, cannot log in
    - SUSPENDED: Temporarily disabled, pending investigation
    - PENDING: Account created but not yet activated (email verification)
    """
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class EmploymentStatus(str, Enum):
    """Employee employment status.

    Tracks employee lifecycle:
    - ACTIVE: Currently employed, working
    - TERMINATED: Employment ended (voluntary or involuntary)
    - ON_LEAVE: Temporarily away (FMLA, medical, personal leave)
    - SUSPENDED: Disciplinary suspension

    COMPLIANCE NOTE: Status transitions affect document retention requirements.
    Different states have different final paycheck and document delivery timelines.
    """
    ACTIVE = "active"
    TERMINATED = "terminated"
    ON_LEAVE = "on_leave"
    SUSPENDED = "suspended"


class DocumentCategory(str, Enum):
    """Document categories aligned with HR compliance requirements.

    Categories determine:
    - Retention period requirements
    - Required review workflows
    - Privacy/security classification
    - State-specific regulations

    COMPLIANCE NOTES:
    - I9: Must be retained for 3 years after hire or 1 year after termination,
      whichever is later (USCIS requirement)
    - W4: Required for payroll tax withholding (IRS)
    - DIRECT_DEPOSIT: Banking information, requires enhanced PII protection
    - BENEFITS: ERISA compliance, typically 6 years retention
    - PERFORMANCE: Support for unemployment claims, discipline, termination
    - POLICY_ACKNOWLEDGMENT: Proof of employee awareness of policies
    """
    I9 = "i9"
    W4 = "w4"
    DIRECT_DEPOSIT = "direct_deposit"
    BENEFITS_ENROLLMENT = "benefits_enrollment"
    PERFORMANCE_REVIEW = "performance_review"
    DISCIPLINARY_ACTION = "disciplinary_action"
    TERMINATION = "termination"
    POLICY_ACKNOWLEDGMENT = "policy_acknowledgment"
    OTHER = "other"


class DocumentStatus(str, Enum):
    """Document workflow status.

    Tracks document through review and approval lifecycle:
    - PENDING_REVIEW: Submitted, awaiting HR review
    - APPROVED: Reviewed and accepted, officially on file
    - REJECTED: Does not meet requirements, employee must resubmit
    - EXPIRED: Document has passed expiration date (e.g., I-9 work authorization)

    COMPLIANCE NOTE: Only APPROVED documents satisfy compliance requirements.
    Rejected/expired documents do not count toward completion of onboarding.
    """
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class SubmissionChannel(str, Enum):
    """Channel through which document was submitted.

    Tracks intake method for audit and troubleshooting:
    - EMAIL: Received via email (parsed from inbox)
    - WEB_UPLOAD: Direct upload through web portal
    - MOBILE: Submitted via mobile app
    - FAX: Legacy fax submission (parsed via fax-to-email)
    - MAIL: Physical mail, scanned by HR staff
    - API: Submitted via integration (e.g., from HRIS)
    """
    EMAIL = "email"
    WEB_UPLOAD = "web_upload"
    MOBILE = "mobile"
    FAX = "fax"
    MAIL = "mail"
    API = "api"


class SubmissionStatus(str, Enum):
    """Submission processing status.

    Tracks intake workflow:
    - RECEIVED: Submission captured, not yet processed
    - PROCESSING: Being parsed, validated, matched to employee
    - MATCHED: Successfully matched to employee record
    - DOCUMENT_CREATED: Document entity created from submission
    - FAILED: Processing failed (e.g., could not identify employee)
    - DUPLICATE: Identical submission already processed
    """
    RECEIVED = "received"
    PROCESSING = "processing"
    MATCHED = "matched"
    DOCUMENT_CREATED = "document_created"
    FAILED = "failed"
    DUPLICATE = "duplicate"


class AuditAction(str, Enum):
    """Audit event action types.

    Standardized action vocabulary for audit trail.
    All data mutations must generate an audit event.
    """
    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"
    VIEWED = "viewed"
    DOWNLOADED = "downloaded"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPORTED = "exported"
    RESTORED = "restored"
    PURGED = "purged"


class AuditEntityType(str, Enum):
    """Entity types that can be audited.

    Corresponds to main tables in the system.
    """
    ORGANIZATION = "organization"
    USER = "user"
    ROLE = "role"
    EMPLOYEE = "employee"
    DOCUMENT = "document"
    DOCUMENT_VERSION = "document_version"
    SUBMISSION = "submission"
    LEGAL_HOLD = "legal_hold"
    RETENTION_POLICY = "retention_policy"


class LegalHoldStatus(str, Enum):
    """Legal hold status.

    Controls retention policy overrides:
    - ACTIVE: Hold is in effect, documents cannot be purged
    - RELEASED: Hold has been lifted, normal retention applies
    - PENDING: Hold created but not yet in effect

    COMPLIANCE NOTE: Documents under legal hold MUST NOT be deleted
    regardless of retention policy. Spoliation of evidence can result
    in severe legal penalties.
    """
    ACTIVE = "active"
    RELEASED = "released"
    PENDING = "pending"


class LegalHoldScopeType(str, Enum):
    """Legal hold scope type.

    Defines what the hold applies to:
    - EMPLOYEE: All documents for specific employee(s)
    - DEPARTMENT: All documents for department
    - DATE_RANGE: All documents within date range
    - DOCUMENT_CATEGORY: All documents of specific category
    - CUSTOM: Custom filter criteria in scope_value JSON
    """
    EMPLOYEE = "employee"
    DEPARTMENT = "department"
    DATE_RANGE = "date_range"
    DOCUMENT_CATEGORY = "document_category"
    CUSTOM = "custom"


class RoleType(str, Enum):
    """Standard RBAC role types.

    Predefined roles following least-privilege principles:
    - SUPER_ADMIN: Full system access (DocFlow platform admin)
    - ORG_ADMIN: Full access within organization
    - HR_ADMIN: Full HR operations, can manage employees and documents
    - HR_GENERALIST: Standard HR operations, limited configuration
    - PAYROLL_SPECIALIST: Access to payroll-related documents (W-4, direct deposit)
    - BENEFITS_ADMIN: Access to benefits enrollment documents
    - HIRING_MANAGER: View employees in their department
    - EMPLOYEE: Self-service access to own documents

    COMPLIANCE NOTE: Role assignments must be audited. Access to PII
    (SSN, salary, bank accounts) should be restricted to roles that
    require it for their job function.
    """
    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    HR_ADMIN = "hr_admin"
    HR_GENERALIST = "hr_generalist"
    PAYROLL_SPECIALIST = "payroll_specialist"
    BENEFITS_ADMIN = "benefits_admin"
    HIRING_MANAGER = "hiring_manager"
    EMPLOYEE = "employee"


class USState(str, Enum):
    """US state codes for state-specific compliance.

    State codes are used for:
    - Retention policy requirements (vary by state)
    - Final paycheck timing rules
    - Unemployment claim reporting
    - State-specific leave laws (CA CFRA, NY Paid Family Leave, etc.)

    COMPLIANCE NOTE: California, New York, and Massachusetts have
    particularly strict document retention and employee rights laws.
    """
    AL = "AL"
    AK = "AK"
    AZ = "AZ"
    AR = "AR"
    CA = "CA"
    CO = "CO"
    CT = "CT"
    DE = "DE"
    FL = "FL"
    GA = "GA"
    HI = "HI"
    ID = "ID"
    IL = "IL"
    IN = "IN"
    IA = "IA"
    KS = "KS"
    KY = "KY"
    LA = "LA"
    ME = "ME"
    MD = "MD"
    MA = "MA"
    MI = "MI"
    MN = "MN"
    MS = "MS"
    MO = "MO"
    MT = "MT"
    NE = "NE"
    NV = "NV"
    NH = "NH"
    NJ = "NJ"
    NM = "NM"
    NY = "NY"
    NC = "NC"
    ND = "ND"
    OH = "OH"
    OK = "OK"
    OR = "OR"
    PA = "PA"
    RI = "RI"
    SC = "SC"
    SD = "SD"
    TN = "TN"
    TX = "TX"
    UT = "UT"
    VT = "VT"
    VA = "VA"
    WA = "WA"
    WV = "WV"
    WI = "WI"
    WY = "WY"
    DC = "DC"  # District of Columbia
