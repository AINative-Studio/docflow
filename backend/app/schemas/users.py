"""Pydantic schemas for user management."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class UserRole(str, Enum):
    """User role enumeration."""

    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    HR_MANAGER = "hr_manager"
    HR_USER = "hr_user"
    EMPLOYEE = "employee"
    VIEWER = "viewer"


class UserStatus(str, Enum):
    """User status enumeration."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"


class UserInviteRequest(BaseModel):
    """Schema for inviting a new user."""

    email: EmailStr = Field(
        ...,
        description="Email address to invite"
    )
    role: UserRole = Field(
        default=UserRole.HR_USER,
        description="Role to assign to the user"
    )
    first_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="User's first name"
    )
    last_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="User's last name"
    )
    employee_id: Optional[str] = Field(
        default=None,
        description="Link to existing employee record"
    )
    custom_message: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Custom message to include in invitation email"
    )


class UserInviteResponse(BaseModel):
    """Schema for user invitation response."""

    id: str = Field(..., description="Invitation unique identifier")
    user_id: str = Field(..., description="Created user identifier")
    email: str = Field(..., description="Invited email address")
    role: UserRole = Field(..., description="Assigned role")
    status: str = Field(default="pending", description="Invitation status")
    expires_at: datetime = Field(..., description="Invitation expiration")
    magic_link_sent: bool = Field(default=True, description="Whether magic link was sent")

    model_config = {"from_attributes": True}


class UserActivateRequest(BaseModel):
    """Schema for activating user via magic link."""

    token: str = Field(
        ...,
        min_length=32,
        description="Magic link activation token"
    )
    password: Optional[str] = Field(
        default=None,
        min_length=8,
        max_length=128,
        description="Optional password to set (if password auth enabled)"
    )


class UserActivateResponse(BaseModel):
    """Schema for user activation response."""

    id: str = Field(..., description="User unique identifier")
    email: str = Field(..., description="User email address")
    role: UserRole = Field(..., description="User role")
    status: UserStatus = Field(..., description="User status (should be active)")
    org_id: str = Field(..., description="Organization identifier")
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    activated_at: datetime = Field(..., description="Activation timestamp")

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    """Schema for user response."""

    id: str = Field(..., description="User unique identifier")
    email: str = Field(..., description="User email address")
    first_name: Optional[str] = Field(default=None, description="First name")
    last_name: Optional[str] = Field(default=None, description="Last name")
    role: UserRole = Field(..., description="User role")
    status: UserStatus = Field(..., description="User status")
    org_id: str = Field(..., description="Organization identifier")
    employee_id: Optional[str] = Field(default=None, description="Linked employee record")
    last_login_at: Optional[datetime] = Field(default=None, description="Last login timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    """Schema for user list item response."""

    id: str = Field(..., description="User unique identifier")
    email: str = Field(..., description="User email address")
    first_name: Optional[str] = Field(default=None, description="First name")
    last_name: Optional[str] = Field(default=None, description="Last name")
    role: UserRole = Field(..., description="User role")
    status: UserStatus = Field(..., description="User status")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = {"from_attributes": True}
