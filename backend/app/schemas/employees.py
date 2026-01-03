"""Pydantic schemas for employee management."""

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class EmploymentStatus(str, Enum):
    """Employment status enumeration."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"
    PENDING = "pending"


class EmploymentType(str, Enum):
    """Employment type enumeration."""

    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    TEMPORARY = "temporary"
    INTERN = "intern"


class EmployeeCreate(BaseModel):
    """Schema for creating a new employee."""

    employee_number: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Employee ID/number (auto-generated if not provided)"
    )
    first_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Employee first name"
    )
    last_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Employee last name"
    )
    email: EmailStr = Field(
        ...,
        description="Employee email address"
    )
    phone: Optional[str] = Field(
        default=None,
        max_length=20,
        description="Phone number"
    )
    department: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Department name"
    )
    job_title: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Job title"
    )
    manager_id: Optional[str] = Field(
        default=None,
        description="Manager's employee ID"
    )
    employment_type: EmploymentType = Field(
        default=EmploymentType.FULL_TIME,
        description="Type of employment"
    )
    hire_date: Optional[date] = Field(
        default=None,
        description="Hire date"
    )
    start_date: Optional[date] = Field(
        default=None,
        description="Work start date"
    )
    location: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Work location"
    )
    metadata: Optional[dict] = Field(
        default_factory=dict,
        description="Additional employee metadata"
    )


class EmployeeUpdate(BaseModel):
    """Schema for updating an employee."""

    first_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Employee first name"
    )
    last_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Employee last name"
    )
    email: Optional[EmailStr] = Field(
        default=None,
        description="Employee email address"
    )
    phone: Optional[str] = Field(
        default=None,
        max_length=20,
        description="Phone number"
    )
    department: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Department name"
    )
    job_title: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Job title"
    )
    manager_id: Optional[str] = Field(
        default=None,
        description="Manager's employee ID"
    )
    employment_type: Optional[EmploymentType] = Field(
        default=None,
        description="Type of employment"
    )
    employment_status: Optional[EmploymentStatus] = Field(
        default=None,
        description="Employment status"
    )
    termination_date: Optional[date] = Field(
        default=None,
        description="Termination date (if applicable)"
    )
    location: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Work location"
    )
    metadata: Optional[dict] = Field(
        default=None,
        description="Additional employee metadata"
    )


class EmployeeResponse(BaseModel):
    """Schema for employee response."""

    id: str = Field(..., description="Employee unique identifier")
    org_id: str = Field(..., description="Organization identifier")
    employee_number: str = Field(..., description="Employee ID/number")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    email: str = Field(..., description="Email address")
    phone: Optional[str] = Field(default=None, description="Phone number")
    department: Optional[str] = Field(default=None, description="Department")
    job_title: Optional[str] = Field(default=None, description="Job title")
    manager_id: Optional[str] = Field(default=None, description="Manager's employee ID")
    employment_type: EmploymentType = Field(..., description="Employment type")
    employment_status: EmploymentStatus = Field(..., description="Employment status")
    hire_date: Optional[date] = Field(default=None, description="Hire date")
    start_date: Optional[date] = Field(default=None, description="Start date")
    termination_date: Optional[date] = Field(default=None, description="Termination date")
    location: Optional[str] = Field(default=None, description="Work location")
    user_id: Optional[str] = Field(default=None, description="Linked user account ID")
    metadata: dict = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class EmployeeListResponse(BaseModel):
    """Schema for employee list item response."""

    id: str = Field(..., description="Employee unique identifier")
    employee_number: str = Field(..., description="Employee ID/number")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    email: str = Field(..., description="Email address")
    department: Optional[str] = Field(default=None, description="Department")
    job_title: Optional[str] = Field(default=None, description="Job title")
    employment_status: EmploymentStatus = Field(..., description="Employment status")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = {"from_attributes": True}


class EmployeeSearchQuery(BaseModel):
    """Schema for employee search query parameters."""

    q: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Search query (name, email, employee number)"
    )
    department: Optional[str] = Field(
        default=None,
        description="Filter by department"
    )
    employment_status: Optional[EmploymentStatus] = Field(
        default=None,
        description="Filter by employment status"
    )
    employment_type: Optional[EmploymentType] = Field(
        default=None,
        description="Filter by employment type"
    )
    manager_id: Optional[str] = Field(
        default=None,
        description="Filter by manager ID"
    )
