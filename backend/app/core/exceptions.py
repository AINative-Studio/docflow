"""Custom exceptions for DocFlow HR."""

from typing import Any, Dict, List, Optional


class DocFlowException(Exception):
    """Base exception for DocFlow HR application."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "INTERNAL_ERROR"
        self.details = details
        super().__init__(self.message)


class NotFoundError(DocFlowException):
    """Exception raised when a resource is not found."""

    def __init__(
        self,
        message: str = "Resource not found",
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
    ):
        details = None
        if resource_type or resource_id:
            details = [{"resource_type": resource_type, "resource_id": resource_id}]
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
            details=details,
        )


class ValidationError(DocFlowException):
    """Exception raised for validation errors."""

    def __init__(
        self,
        message: str = "Validation failed",
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
            details=details,
        )


class AuthenticationError(DocFlowException):
    """Exception raised for authentication failures."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR",
        )


class AuthorizationError(DocFlowException):
    """Exception raised for authorization failures."""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
        )


class ConflictError(DocFlowException):
    """Exception raised for resource conflicts."""

    def __init__(
        self,
        message: str = "Resource conflict",
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(
            message=message,
            status_code=409,
            error_code="CONFLICT",
            details=details,
        )


class DatabaseError(DocFlowException):
    """Exception raised for database errors."""

    def __init__(
        self,
        message: str = "Database error occurred",
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(
            message=message,
            status_code=500,
            error_code="DATABASE_ERROR",
            details=details,
        )


class ExternalServiceError(DocFlowException):
    """Exception raised for external service failures."""

    def __init__(
        self,
        message: str = "External service error",
        service_name: Optional[str] = None,
    ):
        details = [{"service": service_name}] if service_name else None
        super().__init__(
            message=message,
            status_code=502,
            error_code="EXTERNAL_SERVICE_ERROR",
            details=details,
        )
