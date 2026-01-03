"""Pydantic schemas for file upload management."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class UploadStatus(str, Enum):
    """Upload status enumeration."""

    PENDING = "pending"
    UPLOADING = "uploading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class UploadType(str, Enum):
    """Upload type enumeration."""

    DOCUMENT = "document"
    ATTACHMENT = "attachment"
    PROFILE_PHOTO = "profile_photo"
    SIGNATURE = "signature"
    OTHER = "other"


class UploadRequest(BaseModel):
    """Schema for initiating a file upload."""

    filename: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Original filename"
    )
    content_type: str = Field(
        ...,
        max_length=100,
        description="MIME type of the file"
    )
    file_size: int = Field(
        ...,
        gt=0,
        le=104857600,  # 100MB max
        description="File size in bytes"
    )
    upload_type: UploadType = Field(
        default=UploadType.DOCUMENT,
        description="Type of upload"
    )
    folder: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Target folder path"
    )
    metadata: Optional[dict] = Field(
        default_factory=dict,
        description="Additional upload metadata"
    )


class UploadResponse(BaseModel):
    """Schema for upload initiation response."""

    id: str = Field(..., description="Upload unique identifier")
    upload_url: str = Field(..., description="Pre-signed URL for file upload")
    file_id: str = Field(..., description="File identifier for tracking")
    expires_at: datetime = Field(..., description="Upload URL expiration")
    status: UploadStatus = Field(default=UploadStatus.PENDING, description="Upload status")
    max_file_size: int = Field(..., description="Maximum allowed file size")

    model_config = {"from_attributes": True}


class UploadCompleteRequest(BaseModel):
    """Schema for confirming upload completion."""

    file_id: str = Field(
        ...,
        description="File identifier from upload initiation"
    )
    checksum: Optional[str] = Field(
        default=None,
        description="File checksum for verification"
    )


class UploadCompleteResponse(BaseModel):
    """Schema for upload completion response."""

    id: str = Field(..., description="Upload unique identifier")
    file_id: str = Field(..., description="File identifier")
    status: UploadStatus = Field(..., description="Upload status")
    file_url: Optional[str] = Field(default=None, description="Accessible file URL")
    processed_at: Optional[datetime] = Field(default=None, description="Processing timestamp")

    model_config = {"from_attributes": True}


class FileMetadata(BaseModel):
    """Schema for file metadata."""

    id: str = Field(..., description="File unique identifier")
    org_id: str = Field(..., description="Organization identifier")
    filename: str = Field(..., description="Original filename")
    content_type: str = Field(..., description="MIME type")
    file_size: int = Field(..., description="File size in bytes")
    upload_type: UploadType = Field(..., description="Type of upload")
    folder: Optional[str] = Field(default=None, description="Folder path")
    status: UploadStatus = Field(..., description="Upload status")
    uploader_id: str = Field(..., description="User who uploaded the file")
    metadata: dict = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(..., description="Upload timestamp")

    model_config = {"from_attributes": True}
