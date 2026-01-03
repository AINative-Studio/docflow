"""Pydantic schemas for organization management."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class OrganizationStatus(str, Enum):
    """Organization status enumeration."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class OrganizationCreate(BaseModel):
    """Schema for creating a new organization."""

    name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Organization name"
    )
    slug: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="URL-friendly slug (auto-generated if not provided)"
    )
    domain: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Organization's primary email domain"
    )
    admin_email: EmailStr = Field(
        ...,
        description="Primary admin email address"
    )
    settings: Optional[dict] = Field(
        default_factory=dict,
        description="Organization-specific settings"
    )


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization."""

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=255,
        description="Organization name"
    )
    domain: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Organization's primary email domain"
    )
    status: Optional[OrganizationStatus] = Field(
        default=None,
        description="Organization status"
    )
    settings: Optional[dict] = Field(
        default=None,
        description="Organization-specific settings"
    )


class OrganizationResponse(BaseModel):
    """Schema for organization response."""

    id: str = Field(..., description="Organization unique identifier")
    name: str = Field(..., description="Organization name")
    slug: str = Field(..., description="URL-friendly slug")
    domain: Optional[str] = Field(default=None, description="Primary email domain")
    admin_email: str = Field(..., description="Primary admin email")
    status: OrganizationStatus = Field(..., description="Organization status")
    settings: dict = Field(default_factory=dict, description="Organization settings")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class OrganizationListResponse(BaseModel):
    """Schema for organization list item response."""

    id: str = Field(..., description="Organization unique identifier")
    name: str = Field(..., description="Organization name")
    slug: str = Field(..., description="URL-friendly slug")
    status: OrganizationStatus = Field(..., description="Organization status")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = {"from_attributes": True}
