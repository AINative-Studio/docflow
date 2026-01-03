"""User and RBAC models for authentication and authorization.

This module implements role-based access control (RBAC) following
least-privilege principles. All system users must have a role that
defines their permissions.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import EmailStr, Field, field_validator

from app.models.base import (
    ZeroDBBaseModel,
    TimestampMixin,
    OrgScopedMixin,
    ZeroDBTableSchema,
)
from app.models.enums import UserStatus, RoleType


class Permission(ZeroDBBaseModel):
    """Permission definition for granular access control.

    Permissions follow the pattern: resource:action
    Examples: employees:read, documents:write, audit:view
    """

    resource: str = Field(
        description="Resource type (e.g., 'employees', 'documents', 'audit')",
    )
    action: str = Field(
        description="Action allowed (e.g., 'read', 'write', 'delete', 'approve')",
    )

    def __str__(self) -> str:
        """String representation of permission."""
        return f"{self.resource}:{self.action}"


class Role(ZeroDBBaseModel, OrgScopedMixin, TimestampMixin):
    """Role definition for RBAC.

    Roles group permissions together and are assigned to users.
    Standard roles are seeded at organization creation, but custom
    roles can be created for specific needs.

    COMPLIANCE NOTE: Changes to role permissions must be audited.
    Granting access to PII requires business justification.
    """

    id: UUID = Field(
        description="Unique role identifier",
    )

    name: str = Field(
        min_length=1,
        max_length=100,
        description="Role name (e.g., 'HR Admin', 'Payroll Specialist')",
    )

    role_type: RoleType = Field(
        description="Standard role type enum",
    )

    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Human-readable description of role purpose and scope",
    )

    permissions: List[str] = Field(
        default_factory=list,
        description="List of permission strings (e.g., ['employees:read', 'documents:write'])",
    )

    is_system_role: bool = Field(
        default=False,
        description="Whether this is a system-defined role (cannot be deleted)",
    )

    is_active: bool = Field(
        default=True,
        description="Whether this role can be assigned to users",
    )

    @field_validator("permissions")
    @classmethod
    def validate_permissions(cls, v: List[str]) -> List[str]:
        """Validate permission format."""
        for perm in v:
            if ":" not in perm:
                raise ValueError(f"Invalid permission format: {perm}. Must be 'resource:action'")
            parts = perm.split(":")
            if len(parts) != 2:
                raise ValueError(f"Invalid permission format: {perm}. Must be 'resource:action'")
        return v

    @staticmethod
    def table_schema() -> ZeroDBTableSchema:
        """Get ZeroDB table schema for roles.

        Returns:
            Table schema definition for ZeroDB
        """
        return ZeroDBTableSchema(
            columns=[
                ZeroDBTableSchema.column_def(
                    "id", "uuid", primary_key=True, default="gen_random_uuid()"
                ),
                ZeroDBTableSchema.column_def(
                    "org_id", "uuid", nullable=False, references="organizations(id)"
                ),
                ZeroDBTableSchema.column_def(
                    "name", "text", nullable=False
                ),
                ZeroDBTableSchema.column_def(
                    "role_type", "text", nullable=False
                ),
                ZeroDBTableSchema.column_def(
                    "description", "text", nullable=True
                ),
                ZeroDBTableSchema.column_def(
                    "permissions", "jsonb", nullable=False, default="'[]'::jsonb"
                ),
                ZeroDBTableSchema.column_def(
                    "is_system_role", "boolean", nullable=False, default="false"
                ),
                ZeroDBTableSchema.column_def(
                    "is_active", "boolean", nullable=False, default="true"
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
                    "idx_roles_org_id", ["org_id"]
                ),
                ZeroDBTableSchema.index_def(
                    "idx_roles_org_role_type", ["org_id", "role_type"], unique=True
                ),
                ZeroDBTableSchema.index_def(
                    "idx_roles_active", ["org_id", "is_active"]
                ),
            ],
        )


class User(ZeroDBBaseModel, OrgScopedMixin, TimestampMixin):
    """User account for system access.

    Users authenticate to the system and are assigned roles that
    determine their permissions. Users may also be linked to employee
    records for self-service access.

    SECURITY NOTES:
    - Password hashes must never be logged or included in API responses
    - Failed login attempts should be tracked to prevent brute force
    - MFA should be required for admin roles
    - Session tokens should expire and be invalidated on logout
    """

    id: UUID = Field(
        description="Unique user identifier",
    )

    email: EmailStr = Field(
        description="User email address (used for login)",
    )

    password_hash: str = Field(
        description="Bcrypt password hash (NEVER expose in API responses)",
    )

    first_name: str = Field(
        min_length=1,
        max_length=100,
        description="User first name",
    )

    last_name: str = Field(
        min_length=1,
        max_length=100,
        description="User last name",
    )

    status: UserStatus = Field(
        default=UserStatus.ACTIVE,
        description="User account status",
    )

    role_id: UUID = Field(
        description="Role ID (foreign key to roles table)",
    )

    # Optional link to employee record (for employee self-service)
    employee_id: Optional[UUID] = Field(
        default=None,
        description="Employee record ID if user is an employee (for self-service)",
    )

    # Security tracking
    last_login_at: Optional[datetime] = Field(
        default=None,
        description="Timestamp of last successful login",
    )

    failed_login_attempts: int = Field(
        default=0,
        description="Count of consecutive failed login attempts",
    )

    locked_until: Optional[datetime] = Field(
        default=None,
        description="Account locked until this timestamp (after too many failed attempts)",
    )

    # Email verification
    email_verified: bool = Field(
        default=False,
        description="Whether user has verified their email address",
    )

    email_verification_token: Optional[str] = Field(
        default=None,
        description="Token for email verification (NULL after verification)",
    )

    # Password reset
    password_reset_token: Optional[str] = Field(
        default=None,
        description="Token for password reset (NULL when not in reset flow)",
    )

    password_reset_expires: Optional[datetime] = Field(
        default=None,
        description="Expiration timestamp for password reset token",
    )

    # Preferences
    preferences: Dict[str, Any] = Field(
        default_factory=dict,
        description="User preferences and UI settings as JSON",
    )

    @field_validator("password_hash")
    @classmethod
    def validate_password_hash(cls, v: str) -> str:
        """Validate password hash format (bcrypt)."""
        if not v.startswith("$2b$") and not v.startswith("$2a$"):
            raise ValueError("Password hash must be bcrypt format")
        return v

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"

    @staticmethod
    def table_schema() -> ZeroDBTableSchema:
        """Get ZeroDB table schema for users.

        Returns:
            Table schema definition for ZeroDB
        """
        return ZeroDBTableSchema(
            columns=[
                ZeroDBTableSchema.column_def(
                    "id", "uuid", primary_key=True, default="gen_random_uuid()"
                ),
                ZeroDBTableSchema.column_def(
                    "org_id", "uuid", nullable=False, references="organizations(id)"
                ),
                ZeroDBTableSchema.column_def(
                    "email", "text", nullable=False
                ),
                ZeroDBTableSchema.column_def(
                    "password_hash", "text", nullable=False
                ),
                ZeroDBTableSchema.column_def(
                    "first_name", "text", nullable=False
                ),
                ZeroDBTableSchema.column_def(
                    "last_name", "text", nullable=False
                ),
                ZeroDBTableSchema.column_def(
                    "status", "text", nullable=False, default="'active'"
                ),
                ZeroDBTableSchema.column_def(
                    "role_id", "uuid", nullable=False, references="roles(id)"
                ),
                ZeroDBTableSchema.column_def(
                    "employee_id", "uuid", nullable=True, references="employees(id)"
                ),
                ZeroDBTableSchema.column_def(
                    "last_login_at", "timestamp", nullable=True
                ),
                ZeroDBTableSchema.column_def(
                    "failed_login_attempts", "integer", nullable=False, default="0"
                ),
                ZeroDBTableSchema.column_def(
                    "locked_until", "timestamp", nullable=True
                ),
                ZeroDBTableSchema.column_def(
                    "email_verified", "boolean", nullable=False, default="false"
                ),
                ZeroDBTableSchema.column_def(
                    "email_verification_token", "text", nullable=True
                ),
                ZeroDBTableSchema.column_def(
                    "password_reset_token", "text", nullable=True
                ),
                ZeroDBTableSchema.column_def(
                    "password_reset_expires", "timestamp", nullable=True
                ),
                ZeroDBTableSchema.column_def(
                    "preferences", "jsonb", nullable=False, default="'{}'::jsonb"
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
                    "idx_users_org_id", ["org_id"]
                ),
                ZeroDBTableSchema.index_def(
                    "idx_users_email", ["org_id", "email"], unique=True
                ),
                ZeroDBTableSchema.index_def(
                    "idx_users_role_id", ["role_id"]
                ),
                ZeroDBTableSchema.index_def(
                    "idx_users_employee_id", ["employee_id"],
                    where="employee_id IS NOT NULL"
                ),
                ZeroDBTableSchema.index_def(
                    "idx_users_status", ["org_id", "status"]
                ),
            ],
        )
