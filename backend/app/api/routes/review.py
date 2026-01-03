"""HR Review Workflow API routes for DocFlow HR.

This module provides endpoints for the document review workflow:
- GET /review-queue - Get documents pending review
- POST /documents/{id}/approve - Approve a document
- POST /documents/{id}/reject - Reject a document
"""

import logging
from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.api.deps import (
    ActiveUserDep,
    DBDep,
    RequestIdDep,
    require_role,
)
from app.core.events import EventType, audit_logger
from app.core.exceptions import AuthorizationError, NotFoundError
from app.db.zerodb_client import ZeroDBClient
from app.schemas.review import (
    ApproveRequest,
    RejectRequest,
    ReviewQueueItem,
    ReviewQueueResponse,
    ReviewResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Review Workflow"])

# Roles allowed to perform review actions
HR_REVIEW_ROLES = ["hr_manager", "hr_admin", "HR Manager", "HR Admin"]


async def get_hr_reviewer(
    current_user: Annotated[dict, Depends(require_role(HR_REVIEW_ROLES))],
) -> dict:
    """Dependency to ensure user has HR review permissions.

    Args:
        current_user: Current authenticated user with HR role

    Returns:
        Current user data
    """
    return current_user


HRReviewerDep = Annotated[dict, Depends(get_hr_reviewer)]


@router.get(
    "/review-queue",
    response_model=ReviewQueueResponse,
    summary="Get documents pending review",
    description="Retrieve a paginated list of documents that are pending HR review. "
    "Only documents belonging to the authenticated user's organization are returned.",
)
async def get_review_queue(
    request: Request,
    db: DBDep,
    current_user: ActiveUserDep,
    request_id: RequestIdDep,
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(default=None, description="Filter by document category"),
    submission_channel: Optional[str] = Query(
        default=None, description="Filter by submission channel"
    ),
) -> ReviewQueueResponse:
    """Get documents pending review for the organization.

    This endpoint retrieves all documents with status "needs_review" that belong
    to the authenticated user's organization. Results are paginated and can be
    filtered by category or submission channel.

    Args:
        request: HTTP request object
        db: Database client
        current_user: Authenticated user data
        request_id: Request tracking ID
        page: Page number for pagination
        page_size: Number of items per page
        category: Optional category filter
        submission_channel: Optional submission channel filter

    Returns:
        ReviewQueueResponse with paginated list of documents pending review
    """
    org_id = current_user.get("org_id")
    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User organization ID not found in token",
        )

    # Build filters for the query
    filters: dict = {
        "org_id": org_id,
        "status": "needs_review",
    }

    if category:
        filters["category"] = category
    if submission_channel:
        filters["submission_channel"] = submission_channel

    logger.info(
        f"Fetching review queue for org {org_id}, page {page}, "
        f"page_size {page_size}, filters {filters}"
    )

    try:
        # Calculate offset for pagination
        offset = (page - 1) * page_size

        # Query documents needing review
        documents = await db.table_query(
            "documents",
            filters=filters,
            limit=page_size,
            offset=offset,
        )

        # Get total count for pagination (query without limit/offset)
        # For now, we'll make an additional query or estimate
        # In production, this should use a count endpoint
        all_docs = await db.table_query(
            "documents",
            filters=filters,
            limit=1000,  # Max reasonable limit for counting
            offset=0,
        )
        total = len(all_docs)

        # Transform documents to ReviewQueueItem format
        items = []
        for doc in documents:
            # Get employee info if available
            employee_name = doc.get("employee_name", "Unknown")
            employee_id = doc.get("employee_id", "")

            # If employee info is not embedded, fetch it
            if not employee_name or employee_name == "Unknown":
                if employee_id:
                    try:
                        employees = await db.table_query(
                            "employees",
                            filters={"id": employee_id},
                            limit=1,
                        )
                        if employees:
                            emp = employees[0]
                            employee_name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip()
                            if not employee_name:
                                employee_name = emp.get("name", "Unknown")
                    except Exception as e:
                        logger.warning(f"Failed to fetch employee {employee_id}: {e}")

            # Parse submitted_at timestamp
            submitted_at_raw = doc.get("submitted_at") or doc.get("created_at")
            if isinstance(submitted_at_raw, str):
                try:
                    submitted_at = datetime.fromisoformat(submitted_at_raw.replace("Z", "+00:00"))
                except ValueError:
                    submitted_at = datetime.utcnow()
            elif isinstance(submitted_at_raw, datetime):
                submitted_at = submitted_at_raw
            else:
                submitted_at = datetime.utcnow()

            items.append(
                ReviewQueueItem(
                    document_id=doc.get("id", ""),
                    employee_name=employee_name,
                    employee_id=employee_id,
                    document_category=doc.get("category", "uncategorized"),
                    submitted_at=submitted_at,
                    submission_channel=doc.get("submission_channel", "unknown"),
                    document_name=doc.get("name") or doc.get("filename"),
                    file_type=doc.get("file_type") or doc.get("content_type"),
                )
            )

        # Calculate pagination metadata
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        has_next = page < total_pages
        has_previous = page > 1

        return ReviewQueueResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_next=has_next,
            has_previous=has_previous,
        )

    except NotFoundError:
        # Table doesn't exist yet - return empty result
        return ReviewQueueResponse(
            items=[],
            total=0,
            page=page,
            page_size=page_size,
            has_next=False,
            has_previous=False,
        )


@router.post(
    "/documents/{document_id}/approve",
    response_model=ReviewResponse,
    summary="Approve a document",
    description="Approve a document that is pending review. "
    "Requires HR Manager or HR Admin role.",
)
async def approve_document(
    request: Request,
    document_id: str,
    db: DBDep,
    reviewer: HRReviewerDep,
    request_id: RequestIdDep,
    body: Optional[ApproveRequest] = None,
) -> ReviewResponse:
    """Approve a document pending review.

    This endpoint approves a document, updating its status to "approved",
    emitting an audit event, and sending a notification to the employee.

    Args:
        request: HTTP request object
        document_id: ID of the document to approve
        db: Database client
        reviewer: Authenticated HR reviewer
        request_id: Request tracking ID
        body: Optional approval request with notes

    Returns:
        ReviewResponse with the approval details

    Raises:
        HTTPException: If document not found or doesn't belong to org
    """
    org_id = reviewer.get("org_id")
    user_id = reviewer.get("sub") or reviewer.get("user_id")
    user_email = reviewer.get("email", "")
    user_name = reviewer.get("name") or reviewer.get("full_name") or user_email

    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User organization ID not found in token",
        )

    logger.info(f"User {user_id} attempting to approve document {document_id}")

    # Fetch the document
    try:
        documents = await db.table_query(
            "documents",
            filters={"id": document_id},
            limit=1,
        )
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found",
        )

    if not documents:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found",
        )

    document = documents[0]

    # Verify document belongs to the reviewer's organization
    if document.get("org_id") != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Document does not belong to your organization",
        )

    # Verify document is in reviewable state
    current_status = document.get("status")
    if current_status not in ("needs_review", "pending", "submitted"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document cannot be approved. Current status: {current_status}",
        )

    # Update document status
    reviewed_at = datetime.utcnow()
    notes = body.notes if body else None

    update_data = {
        "status": "approved",
        "reviewed_by": user_id,
        "reviewed_by_name": user_name,
        "reviewed_at": reviewed_at.isoformat(),
        "review_notes": notes,
        "updated_at": reviewed_at.isoformat(),
    }

    try:
        await db.table_update(
            "documents",
            filters={"id": document_id},
            update=update_data,
        )
    except Exception as e:
        logger.error(f"Failed to update document {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update document status",
        )

    # Emit audit event
    try:
        await audit_logger.log_event(
            event_type=EventType.DOCUMENT_UPDATED,
            action="document.review.approved",
            user_id=user_id,
            user_email=user_email,
            resource_type="document",
            resource_id=document_id,
            details={
                "previous_status": current_status,
                "new_status": "approved",
                "notes": notes,
                "employee_id": document.get("employee_id"),
            },
            request_id=request_id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    except Exception as e:
        logger.warning(f"Failed to log audit event for approval: {e}")

    # Send notification to employee (async, fire-and-forget)
    try:
        await _send_review_notification(
            db=db,
            employee_id=document.get("employee_id"),
            document_id=document_id,
            document_name=document.get("name") or document.get("filename"),
            action="approved",
            reviewer_name=user_name,
            notes=notes,
        )
    except Exception as e:
        logger.warning(f"Failed to send approval notification: {e}")

    logger.info(f"Document {document_id} approved by {user_id}")

    return ReviewResponse(
        document_id=document_id,
        status="approved",
        reviewed_by=user_id,
        reviewed_by_name=user_name,
        reviewed_at=reviewed_at,
        notes=notes,
    )


@router.post(
    "/documents/{document_id}/reject",
    response_model=ReviewResponse,
    summary="Reject a document",
    description="Reject a document that is pending review. "
    "Requires HR Manager or HR Admin role. A rejection reason must be provided.",
)
async def reject_document(
    request: Request,
    document_id: str,
    body: RejectRequest,
    db: DBDep,
    reviewer: HRReviewerDep,
    request_id: RequestIdDep,
) -> ReviewResponse:
    """Reject a document pending review.

    This endpoint rejects a document, updating its status to "rejected",
    storing the rejection reason, emitting an audit event, and sending
    a notification to the employee with the rejection reason.

    Args:
        request: HTTP request object
        document_id: ID of the document to reject
        body: Rejection request with reason and optional notes
        db: Database client
        reviewer: Authenticated HR reviewer
        request_id: Request tracking ID

    Returns:
        ReviewResponse with the rejection details

    Raises:
        HTTPException: If document not found or doesn't belong to org
    """
    org_id = reviewer.get("org_id")
    user_id = reviewer.get("sub") or reviewer.get("user_id")
    user_email = reviewer.get("email", "")
    user_name = reviewer.get("name") or reviewer.get("full_name") or user_email

    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User organization ID not found in token",
        )

    logger.info(f"User {user_id} attempting to reject document {document_id}")

    # Fetch the document
    try:
        documents = await db.table_query(
            "documents",
            filters={"id": document_id},
            limit=1,
        )
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found",
        )

    if not documents:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found",
        )

    document = documents[0]

    # Verify document belongs to the reviewer's organization
    if document.get("org_id") != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Document does not belong to your organization",
        )

    # Verify document is in reviewable state
    current_status = document.get("status")
    if current_status not in ("needs_review", "pending", "submitted"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document cannot be rejected. Current status: {current_status}",
        )

    # Update document status
    reviewed_at = datetime.utcnow()

    update_data = {
        "status": "rejected",
        "reviewed_by": user_id,
        "reviewed_by_name": user_name,
        "reviewed_at": reviewed_at.isoformat(),
        "rejection_reason": body.reason,
        "review_notes": body.notes,
        "updated_at": reviewed_at.isoformat(),
    }

    try:
        await db.table_update(
            "documents",
            filters={"id": document_id},
            update=update_data,
        )
    except Exception as e:
        logger.error(f"Failed to update document {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update document status",
        )

    # Emit audit event
    try:
        await audit_logger.log_event(
            event_type=EventType.DOCUMENT_UPDATED,
            action="document.review.rejected",
            user_id=user_id,
            user_email=user_email,
            resource_type="document",
            resource_id=document_id,
            details={
                "previous_status": current_status,
                "new_status": "rejected",
                "rejection_reason": body.reason,
                "notes": body.notes,
                "employee_id": document.get("employee_id"),
            },
            request_id=request_id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    except Exception as e:
        logger.warning(f"Failed to log audit event for rejection: {e}")

    # Send notification to employee with rejection reason
    try:
        await _send_review_notification(
            db=db,
            employee_id=document.get("employee_id"),
            document_id=document_id,
            document_name=document.get("name") or document.get("filename"),
            action="rejected",
            reviewer_name=user_name,
            notes=body.notes,
            rejection_reason=body.reason,
        )
    except Exception as e:
        logger.warning(f"Failed to send rejection notification: {e}")

    logger.info(f"Document {document_id} rejected by {user_id}: {body.reason}")

    return ReviewResponse(
        document_id=document_id,
        status="rejected",
        reviewed_by=user_id,
        reviewed_by_name=user_name,
        reviewed_at=reviewed_at,
        notes=body.notes,
        rejection_reason=body.reason,
    )


async def _send_review_notification(
    db: ZeroDBClient,
    employee_id: Optional[str],
    document_id: str,
    document_name: Optional[str],
    action: str,
    reviewer_name: str,
    notes: Optional[str] = None,
    rejection_reason: Optional[str] = None,
) -> None:
    """Send a notification to an employee about a document review action.

    This is a helper function that creates a notification record in the database.
    In a production system, this might also trigger email, push notifications, etc.

    Args:
        db: Database client
        employee_id: ID of the employee to notify
        document_id: ID of the reviewed document
        document_name: Name of the document
        action: The review action ("approved" or "rejected")
        reviewer_name: Name of the reviewer
        notes: Optional review notes
        rejection_reason: Reason for rejection (if rejected)
    """
    if not employee_id:
        logger.warning(f"Cannot send notification: no employee_id for document {document_id}")
        return

    # Build notification message
    doc_display_name = document_name or f"Document {document_id}"

    if action == "approved":
        title = "Document Approved"
        message = f"Your document '{doc_display_name}' has been approved by {reviewer_name}."
        if notes:
            message += f" Notes: {notes}"
    else:
        title = "Document Rejected"
        message = f"Your document '{doc_display_name}' has been rejected by {reviewer_name}."
        if rejection_reason:
            message += f" Reason: {rejection_reason}"
        if notes:
            message += f" Additional notes: {notes}"

    notification_data = {
        "employee_id": employee_id,
        "type": "document_review",
        "title": title,
        "message": message,
        "document_id": document_id,
        "action": action,
        "reviewer_name": reviewer_name,
        "read": False,
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        await db.table_insert("notifications", [notification_data])
        logger.info(f"Notification sent to employee {employee_id} for document {document_id}")
    except Exception as e:
        # Log but don't fail the request if notification fails
        logger.error(f"Failed to create notification for employee {employee_id}: {e}")
