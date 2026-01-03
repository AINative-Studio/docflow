"""Audit Event Service for DocFlow HR.

This module provides the core audit functionality for emitting and querying
immutable audit events. All events are append-only and cannot be modified
or deleted once created.

Example usage:
    from app.services.audit import AuditService, emit_audit_event

    # Using the convenience function
    await emit_audit_event(
        db=db_client,
        entity_type="document",
        entity_id="doc-123",
        action="document.received",
        actor_id="user-456",
        org_id="org-789",
        metadata={"source": "email", "sender": "hr@company.com"}
    )

    # Using the service class
    audit_service = AuditService(db_client)
    events = await audit_service.query_events(
        org_id="org-789",
        entity_type="document",
        page=1,
        page_size=20
    )
"""

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from app.db.zerodb_client import ZeroDBClient
from app.schemas.audit import (
    AuditEvent,
    AuditEventCreate,
    AuditEventFilter,
)

logger = logging.getLogger(__name__)

# Constants
AUDIT_EVENTS_TABLE = "audit_events"


class AuditService:
    """Service for managing audit events.

    This service provides methods for creating and querying audit events.
    All events are immutable - once created, they cannot be modified or deleted.

    Attributes:
        db: ZeroDB client instance for database operations.
    """

    def __init__(self, db: ZeroDBClient) -> None:
        """Initialize the audit service.

        Args:
            db: ZeroDB client instance.
        """
        self.db = db

    async def emit_event(
        self,
        entity_type: str,
        entity_id: str,
        action: str,
        actor_id: str,
        org_id: str,
        actor_email: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditEvent:
        """Emit a new audit event.

        Creates an immutable audit event record. Once created, the event
        cannot be modified or deleted.

        Args:
            entity_type: Type of entity (e.g., "document", "employee").
            entity_id: Unique identifier of the entity.
            action: Action performed (e.g., "document.received").
            actor_id: ID of the user or system performing the action.
            org_id: Organization ID the event belongs to.
            actor_email: Optional email of the actor.
            metadata: Optional additional context about the event.

        Returns:
            The created AuditEvent.

        Example:
            ```python
            event = await audit_service.emit_event(
                entity_type="document",
                entity_id="doc-123",
                action="document.version.created",
                actor_id="user-456",
                org_id="org-789",
                actor_email="john@company.com",
                metadata={"version": "2.0", "changes": ["Updated policy section"]}
            )
            ```
        """
        event_id = str(uuid.uuid4())
        created_at = datetime.utcnow()

        event_data = {
            "id": event_id,
            "org_id": org_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "action": action,
            "actor_id": actor_id,
            "actor_email": actor_email,
            "metadata": metadata,
            "created_at": created_at.isoformat(),
        }

        logger.info(
            f"Emitting audit event: {action} for {entity_type}/{entity_id} "
            f"by actor {actor_id} in org {org_id}"
        )

        # Insert into database (append-only)
        await self.db.table_insert(AUDIT_EVENTS_TABLE, [event_data])

        return AuditEvent(
            id=event_id,
            org_id=org_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            actor_id=actor_id,
            actor_email=actor_email,
            metadata=metadata,
            created_at=created_at,
        )

    async def query_events(
        self,
        org_id: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        action: Optional[str] = None,
        actor_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[AuditEvent], int]:
        """Query audit events with optional filters.

        Args:
            org_id: Organization ID to filter by (required).
            entity_type: Optional filter by entity type.
            entity_id: Optional filter by entity ID.
            action: Optional filter by action type.
            actor_id: Optional filter by actor ID.
            start_date: Optional filter for events after this date.
            end_date: Optional filter for events before this date.
            page: Page number (1-indexed).
            page_size: Number of items per page.

        Returns:
            Tuple of (list of AuditEvents, total count).

        Example:
            ```python
            events, total = await audit_service.query_events(
                org_id="org-789",
                entity_type="document",
                action="document.review.approved",
                start_date=datetime(2024, 1, 1),
                page=1,
                page_size=50
            )
            ```
        """
        # Build filter conditions
        filters: Dict[str, Any] = {"org_id": org_id}

        if entity_type:
            filters["entity_type"] = entity_type
        if entity_id:
            filters["entity_id"] = entity_id
        if action:
            filters["action"] = action
        if actor_id:
            filters["actor_id"] = actor_id

        # Date range filters (using ZeroDB comparison operators)
        if start_date:
            filters["created_at"] = filters.get("created_at", {})
            filters["created_at"]["$gte"] = start_date.isoformat()
        if end_date:
            filters["created_at"] = filters.get("created_at", {})
            filters["created_at"]["$lte"] = end_date.isoformat()

        logger.info(f"Querying audit events with filters: {filters}")

        # Calculate offset
        offset = (page - 1) * page_size

        # Query the database
        rows = await self.db.table_query(
            AUDIT_EVENTS_TABLE,
            filters=filters,
            limit=page_size,
            offset=offset,
        )

        # Get total count (query with same filters but no pagination)
        # Note: In production, this would use a COUNT query for efficiency
        all_rows = await self.db.table_query(
            AUDIT_EVENTS_TABLE,
            filters=filters,
            limit=10000,  # Large limit for counting
            offset=0,
        )
        total = len(all_rows)

        # Convert to AuditEvent objects
        events = [self._row_to_event(row) for row in rows]

        return events, total

    async def get_document_audit_trail(
        self,
        org_id: str,
        document_id: str,
    ) -> List[AuditEvent]:
        """Get the complete audit trail for a specific document.

        Returns all audit events for a document in chronological order.

        Args:
            org_id: Organization ID.
            document_id: Document ID to get audit trail for.

        Returns:
            List of AuditEvents in chronological order (oldest first).

        Example:
            ```python
            trail = await audit_service.get_document_audit_trail(
                org_id="org-789",
                document_id="doc-123"
            )
            for event in trail:
                print(f"{event.created_at}: {event.action} by {event.actor_id}")
            ```
        """
        filters = {
            "org_id": org_id,
            "entity_type": "document",
            "entity_id": document_id,
        }

        logger.info(f"Getting audit trail for document: {document_id}")

        # Query all events for this document
        rows = await self.db.table_query(
            AUDIT_EVENTS_TABLE,
            filters=filters,
            limit=10000,  # Get all events
            offset=0,
        )

        # Convert to AuditEvent objects
        events = [self._row_to_event(row) for row in rows]

        # Sort by created_at in chronological order
        events.sort(key=lambda e: e.created_at)

        return events

    def _row_to_event(self, row: Dict[str, Any]) -> AuditEvent:
        """Convert a database row to an AuditEvent object.

        Args:
            row: Dictionary from database query.

        Returns:
            AuditEvent object.
        """
        created_at = row.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))

        return AuditEvent(
            id=row["id"],
            org_id=row["org_id"],
            entity_type=row["entity_type"],
            entity_id=row["entity_id"],
            action=row["action"],
            actor_id=row["actor_id"],
            actor_email=row.get("actor_email"),
            metadata=row.get("metadata"),
            created_at=created_at,
        )


# =============================================================================
# Convenience Functions for Easy Event Emission
# =============================================================================


async def emit_audit_event(
    db: ZeroDBClient,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_id: str,
    org_id: str,
    actor_email: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    """Convenience function to emit an audit event.

    This is a simple wrapper around AuditService.emit_event() for easy
    use throughout the application.

    Args:
        db: ZeroDB client instance.
        entity_type: Type of entity (e.g., "document", "employee").
        entity_id: Unique identifier of the entity.
        action: Action performed (e.g., "document.received").
        actor_id: ID of the user or system performing the action.
        org_id: Organization ID the event belongs to.
        actor_email: Optional email of the actor.
        metadata: Optional additional context about the event.

    Returns:
        The created AuditEvent.

    Example:
        ```python
        from app.services.audit import emit_audit_event

        # In a route handler
        await emit_audit_event(
            db=db,
            entity_type="document",
            entity_id=doc_id,
            action="document.received",
            actor_id=current_user["sub"],
            org_id=current_user["org_id"],
            actor_email=current_user.get("email"),
            metadata={"source": "upload", "filename": "policy.pdf"}
        )
        ```
    """
    service = AuditService(db)
    return await service.emit_event(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        actor_id=actor_id,
        org_id=org_id,
        actor_email=actor_email,
        metadata=metadata,
    )


# =============================================================================
# Pre-defined Event Emitters for Common Actions
# =============================================================================


async def emit_document_received(
    db: ZeroDBClient,
    document_id: str,
    actor_id: str,
    org_id: str,
    actor_email: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    """Emit a document.received event."""
    return await emit_audit_event(
        db=db,
        entity_type="document",
        entity_id=document_id,
        action="document.received",
        actor_id=actor_id,
        org_id=org_id,
        actor_email=actor_email,
        metadata=metadata,
    )


async def emit_document_version_created(
    db: ZeroDBClient,
    document_id: str,
    actor_id: str,
    org_id: str,
    version: str,
    actor_email: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    """Emit a document.version.created event."""
    event_metadata = {"version": version}
    if metadata:
        event_metadata.update(metadata)

    return await emit_audit_event(
        db=db,
        entity_type="document",
        entity_id=document_id,
        action="document.version.created",
        actor_id=actor_id,
        org_id=org_id,
        actor_email=actor_email,
        metadata=event_metadata,
    )


async def emit_document_review_approved(
    db: ZeroDBClient,
    document_id: str,
    actor_id: str,
    org_id: str,
    actor_email: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    """Emit a document.review.approved event."""
    return await emit_audit_event(
        db=db,
        entity_type="document",
        entity_id=document_id,
        action="document.review.approved",
        actor_id=actor_id,
        org_id=org_id,
        actor_email=actor_email,
        metadata=metadata,
    )


async def emit_document_review_rejected(
    db: ZeroDBClient,
    document_id: str,
    actor_id: str,
    org_id: str,
    actor_email: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    """Emit a document.review.rejected event."""
    return await emit_audit_event(
        db=db,
        entity_type="document",
        entity_id=document_id,
        action="document.review.rejected",
        actor_id=actor_id,
        org_id=org_id,
        actor_email=actor_email,
        metadata=metadata,
    )


async def emit_employee_created(
    db: ZeroDBClient,
    employee_id: str,
    actor_id: str,
    org_id: str,
    actor_email: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    """Emit an employee.created event."""
    return await emit_audit_event(
        db=db,
        entity_type="employee",
        entity_id=employee_id,
        action="employee.created",
        actor_id=actor_id,
        org_id=org_id,
        actor_email=actor_email,
        metadata=metadata,
    )


async def emit_employee_updated(
    db: ZeroDBClient,
    employee_id: str,
    actor_id: str,
    org_id: str,
    actor_email: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    """Emit an employee.updated event."""
    return await emit_audit_event(
        db=db,
        entity_type="employee",
        entity_id=employee_id,
        action="employee.updated",
        actor_id=actor_id,
        org_id=org_id,
        actor_email=actor_email,
        metadata=metadata,
    )


async def emit_legal_hold_created(
    db: ZeroDBClient,
    legal_hold_id: str,
    actor_id: str,
    org_id: str,
    actor_email: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    """Emit a legal_hold.created event."""
    return await emit_audit_event(
        db=db,
        entity_type="legal_hold",
        entity_id=legal_hold_id,
        action="legal_hold.created",
        actor_id=actor_id,
        org_id=org_id,
        actor_email=actor_email,
        metadata=metadata,
    )


async def emit_legal_hold_released(
    db: ZeroDBClient,
    legal_hold_id: str,
    actor_id: str,
    org_id: str,
    actor_email: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    """Emit a legal_hold.released event."""
    return await emit_audit_event(
        db=db,
        entity_type="legal_hold",
        entity_id=legal_hold_id,
        action="legal_hold.released",
        actor_id=actor_id,
        org_id=org_id,
        actor_email=actor_email,
        metadata=metadata,
    )
