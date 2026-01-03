"""Audit event logging for DocFlow HR."""

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Types of audit events."""

    # Authentication events
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"
    USER_LOGIN_FAILED = "user.login_failed"
    PASSWORD_CHANGED = "user.password_changed"

    # Document events
    DOCUMENT_CREATED = "document.created"
    DOCUMENT_UPDATED = "document.updated"
    DOCUMENT_DELETED = "document.deleted"
    DOCUMENT_VIEWED = "document.viewed"
    DOCUMENT_DOWNLOADED = "document.downloaded"
    DOCUMENT_SHARED = "document.shared"

    # Employee events
    EMPLOYEE_CREATED = "employee.created"
    EMPLOYEE_UPDATED = "employee.updated"
    EMPLOYEE_DEACTIVATED = "employee.deactivated"

    # Category events
    CATEGORY_CREATED = "category.created"
    CATEGORY_UPDATED = "category.updated"
    CATEGORY_DELETED = "category.deleted"

    # System events
    SYSTEM_ERROR = "system.error"
    SYSTEM_STARTUP = "system.startup"
    SYSTEM_SHUTDOWN = "system.shutdown"


class AuditEvent(BaseModel):
    """Audit event model."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: EventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    action: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_id: Optional[str] = None


class AuditLogger:
    """Audit event logger.

    This is a placeholder implementation that logs to console.
    In production, this would write to a persistent store.
    """

    def __init__(self):
        self._events: list[AuditEvent] = []

    async def log_event(
        self,
        event_type: EventType,
        action: str,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> AuditEvent:
        """Log an audit event.

        Args:
            event_type: Type of the event
            action: Human-readable action description
            user_id: ID of the user who performed the action
            user_email: Email of the user who performed the action
            resource_type: Type of resource affected
            resource_id: ID of resource affected
            details: Additional event details
            ip_address: IP address of the request
            user_agent: User agent string
            request_id: Request tracking ID

        Returns:
            The created audit event
        """
        event = AuditEvent(
            event_type=event_type,
            action=action,
            user_id=user_id,
            user_email=user_email,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )

        # Store event (in-memory for now)
        self._events.append(event)

        # Log to console in development
        print(f"AUDIT: {event.event_type} - {event.action} by {event.user_email}")

        return event

    async def get_events(
        self,
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        event_type: Optional[EventType] = None,
        limit: int = 100,
    ) -> list[AuditEvent]:
        """Retrieve audit events with optional filtering.

        Args:
            user_id: Filter by user ID
            resource_type: Filter by resource type
            resource_id: Filter by resource ID
            event_type: Filter by event type
            limit: Maximum number of events to return

        Returns:
            List of matching audit events
        """
        events = self._events

        if user_id:
            events = [e for e in events if e.user_id == user_id]
        if resource_type:
            events = [e for e in events if e.resource_type == resource_type]
        if resource_id:
            events = [e for e in events if e.resource_id == resource_id]
        if event_type:
            events = [e for e in events if e.event_type == event_type]

        return sorted(events, key=lambda e: e.timestamp, reverse=True)[:limit]


# Global audit logger instance
audit_logger = AuditLogger()
