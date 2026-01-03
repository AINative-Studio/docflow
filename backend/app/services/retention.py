"""Retention policy service for DocFlow HR.

This service handles document retention calculations and deletion scheduling
based on state-specific retention requirements. It integrates with legal hold
service to ensure documents under hold are never deleted prematurely.

Compliance Notes:
- Retention periods vary by state and document type
- Federal baseline: EEOC requires 1 year; FLSA requires 3 years for payroll
- State overrides: Many states have longer requirements (e.g., CA requires 4 years)
- Legal holds ALWAYS take precedence over retention policies
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional

from app.core.events import EventType
from app.core.exceptions import NotFoundError, ValidationError, ConflictError
from app.db.zerodb_client import ZeroDBClient
from app.schemas.retention import (
    RetentionCalculation,
    RetentionPolicy,
    RetentionScheduleResponse,
)

logger = logging.getLogger(__name__)


class RetentionService:
    """Service for managing document retention policies and schedules."""

    def __init__(self, db: ZeroDBClient):
        """Initialize retention service.

        Args:
            db: ZeroDB client for database operations
        """
        self.db = db

    async def calculate_retention_date(
        self,
        employee_id: str,
        document_id: str,
        org_id: str,
    ) -> RetentionCalculation:
        """Calculate deletion date for a document based on retention policy.

        Business Logic:
        1. Fetch employee to get state_of_work and termination_date
        2. Fetch document to get category
        3. Look up retention policy for state + category
        4. Calculate deletion_scheduled_at = termination_date + retention_days
        5. Check if document is under legal hold
        6. If under hold, deletion_scheduled_at = None (blocked)

        Args:
            employee_id: Employee identifier
            document_id: Document identifier
            org_id: Organization identifier

        Returns:
            RetentionCalculation with deletion date and hold status

        Raises:
            NotFoundError: If employee, document, or policy not found
            ValidationError: If employee not terminated (no termination_date)
        """
        logger.info(f"Calculating retention for document {document_id}, employee {employee_id}")

        # 1. Fetch employee
        employees = await self.db.table_query(
            "employees",
            filters={"id": employee_id, "org_id": org_id},
            limit=1,
        )
        if not employees:
            raise NotFoundError(
                message=f"Employee {employee_id} not found",
                resource_type="employee",
                resource_id=employee_id,
            )
        employee = employees[0]

        # 2. Fetch document
        documents = await self.db.table_query(
            "documents",
            filters={"id": document_id, "org_id": org_id},
            limit=1,
        )
        if not documents:
            raise NotFoundError(
                message=f"Document {document_id} not found",
                resource_type="document",
                resource_id=document_id,
            )
        document = documents[0]

        state_code = employee.get("state_of_work")
        termination_date = employee.get("termination_date")
        document_category = document.get("category")

        if not state_code:
            raise ValidationError(
                message="Employee has no state_of_work defined",
                details=[{"field": "state_of_work", "message": "Required for retention calculation"}],
            )

        # 3. Look up retention policy
        policies = await self.db.table_query(
            "retention_policies",
            filters={
                "org_id": org_id,
                "state_code": state_code,
                "document_category": document_category,
            },
            limit=1,
        )

        if not policies:
            raise NotFoundError(
                message=f"No retention policy found for state {state_code}, category {document_category}",
                resource_type="retention_policy",
            )
        policy = policies[0]
        retention_days = policy.get("retention_days", 0)

        # 4. Calculate deletion date
        deletion_scheduled_at = None
        if termination_date:
            # termination_date might be string, convert to date
            if isinstance(termination_date, str):
                from datetime import date
                term_date = date.fromisoformat(termination_date)
            else:
                term_date = termination_date

            # Add retention days
            deletion_date = term_date + timedelta(days=retention_days)
            deletion_scheduled_at = datetime.combine(deletion_date, datetime.min.time())

        # 5. Check legal holds
        legal_holds = await self.db.table_query(
            "legal_holds",
            filters={"org_id": org_id, "status": "active"},
        )

        under_legal_hold = False
        legal_hold_count = 0

        for hold in legal_holds:
            if self._document_matches_hold(document, employee, hold):
                under_legal_hold = True
                legal_hold_count += 1

        # If under hold, block deletion
        if under_legal_hold:
            deletion_scheduled_at = None

        return RetentionCalculation(
            document_id=document_id,
            employee_id=employee_id,
            state_code=state_code,
            retention_days=retention_days,
            termination_date=termination_date,
            deletion_scheduled_at=deletion_scheduled_at,
            under_legal_hold=under_legal_hold,
            legal_hold_count=legal_hold_count,
        )

    async def schedule_deletion(
        self,
        document_id: str,
        deletion_scheduled_at: datetime,
        org_id: str,
        user_id: str,
        reason: Optional[str] = None,
    ) -> RetentionScheduleResponse:
        """Schedule a document for deletion.

        This operation:
        1. Checks if document exists
        2. Verifies document is NOT under legal hold
        3. Updates document.deletion_scheduled_at
        4. Logs audit event

        Args:
            document_id: Document identifier
            deletion_scheduled_at: When to delete the document
            org_id: Organization identifier
            user_id: User scheduling the deletion
            reason: Business justification (optional)

        Returns:
            RetentionScheduleResponse with scheduling details

        Raises:
            NotFoundError: If document doesn't exist
            ConflictError: If document is under legal hold
        """
        logger.info(f"Scheduling deletion for document {document_id} at {deletion_scheduled_at}")

        # 1. Fetch document
        documents = await self.db.table_query(
            "documents",
            filters={"id": document_id, "org_id": org_id},
            limit=1,
        )
        if not documents:
            raise NotFoundError(
                message=f"Document {document_id} not found",
                resource_type="document",
                resource_id=document_id,
            )
        document = documents[0]

        # 2. Check legal holds
        legal_holds = await self.db.table_query(
            "legal_holds",
            filters={"org_id": org_id, "status": "active"},
        )

        # Need employee data to check holds
        employee_id = document.get("employee_id")
        employee = None
        if employee_id:
            employees = await self.db.table_query(
                "employees",
                filters={"id": employee_id, "org_id": org_id},
                limit=1,
            )
            if employees:
                employee = employees[0]

        for hold in legal_holds:
            if self._document_matches_hold(document, employee, hold):
                # Document is under legal hold - CANNOT schedule deletion
                raise ConflictError(
                    message=f"Document is under legal hold '{hold.get('name')}' and cannot be scheduled for deletion",
                    details=[
                        {
                            "field": "legal_hold",
                            "message": "Release legal hold before scheduling deletion",
                            "hold_id": hold.get("id"),
                            "hold_name": hold.get("name"),
                        }
                    ],
                )

        # 3. Update document
        await self.db.table_update(
            "documents",
            filters={"id": document_id, "org_id": org_id},
            update={
                "deletion_scheduled_at": deletion_scheduled_at.isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            },
        )

        # 4. Log audit event
        await self.db.event_create(
            event_type="retention.scheduled",
            entity_type="document",
            entity_id=document_id,
            actor_id=user_id,
            actor_type="user",
            payload={
                "deletion_scheduled_at": deletion_scheduled_at.isoformat(),
                "reason": reason,
                "document_category": document.get("category"),
                "employee_id": employee_id,
            },
        )

        logger.info(f"Document {document_id} scheduled for deletion at {deletion_scheduled_at}")

        return RetentionScheduleResponse(
            document_id=document_id,
            deletion_scheduled_at=deletion_scheduled_at,
            under_legal_hold=False,
            scheduled_by=user_id,
            scheduled_at=datetime.utcnow(),
            message="Document successfully scheduled for deletion",
        )

    def _document_matches_hold(
        self,
        document: dict,
        employee: Optional[dict],
        legal_hold: dict,
    ) -> bool:
        """Check if a document matches a legal hold's scope.

        Args:
            document: Document data
            employee: Employee data (may be None)
            legal_hold: Legal hold definition

        Returns:
            True if document is affected by this hold
        """
        scope_type = legal_hold.get("scope_type")
        scope_value = legal_hold.get("scope_value")

        if scope_type == "employee":
            # Hold applies to specific employee
            return employee and employee.get("id") == scope_value

        elif scope_type == "department":
            # Hold applies to entire department
            return employee and employee.get("department") == scope_value

        elif scope_type == "document_category":
            # Hold applies to document category
            return document.get("category") == scope_value

        elif scope_type == "date_range":
            # Hold applies to documents created in date range
            # scope_value format: "2023-01-01:2023-12-31"
            try:
                start_str, end_str = scope_value.split(":")
                start_date = datetime.fromisoformat(start_str)
                end_date = datetime.fromisoformat(end_str)

                doc_created_at = document.get("created_at")
                if isinstance(doc_created_at, str):
                    doc_created_at = datetime.fromisoformat(doc_created_at)

                return start_date <= doc_created_at <= end_date
            except (ValueError, AttributeError):
                logger.warning(f"Invalid date_range scope: {scope_value}")
                return False

        return False

    async def get_retention_policy(
        self,
        state_code: str,
        document_category: str,
        org_id: str,
    ) -> Optional[RetentionPolicy]:
        """Get retention policy for a state and document category.

        Args:
            state_code: Two-letter state code
            document_category: Document category name
            org_id: Organization identifier

        Returns:
            RetentionPolicy if found, None otherwise
        """
        policies = await self.db.table_query(
            "retention_policies",
            filters={
                "org_id": org_id,
                "state_code": state_code.upper(),
                "document_category": document_category,
            },
            limit=1,
        )

        if policies:
            return RetentionPolicy(**policies[0])
        return None

    async def seed_default_policies(self, org_id: str, user_id: str) -> list[RetentionPolicy]:
        """Seed default state-based retention policies.

        Default retention periods (post-termination):
        - Florida: 5 years (1,825 days)
        - Texas: 4 years (1,460 days)
        - Arizona: 4 years (1,460 days)
        - North Carolina: 3 years (1,095 days)
        - Tennessee: 3 years (1,095 days)

        Note: These apply to all document categories. Override specific
        categories (e.g., payroll, I-9) with longer periods if needed.

        Args:
            org_id: Organization identifier
            user_id: User creating the policies

        Returns:
            List of created retention policies
        """
        state_policies = [
            {"state": "FL", "years": 5, "days": 1825},
            {"state": "TX", "years": 4, "days": 1460},
            {"state": "AZ", "years": 4, "days": 1460},
            {"state": "NC", "years": 3, "days": 1095},
            {"state": "TN", "years": 3, "days": 1095},
        ]

        # Common HR document categories
        categories = [
            "onboarding",
            "tax_forms",
            "benefits",
            "performance",
            "termination",
            "general",
        ]

        created_policies = []

        for state_policy in state_policies:
            for category in categories:
                policy_id = str(uuid.uuid4())
                policy_data = {
                    "id": policy_id,
                    "org_id": org_id,
                    "state_code": state_policy["state"],
                    "document_category": category,
                    "retention_days": state_policy["days"],
                    "created_at": datetime.utcnow().isoformat(),
                    "created_by": user_id,
                }

                await self.db.table_insert("retention_policies", [policy_data])
                created_policies.append(RetentionPolicy(**policy_data))

        logger.info(f"Seeded {len(created_policies)} retention policies for org {org_id}")
        return created_policies
