"""Request logging middleware for DocFlow HR."""

import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses."""

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """Process the request and log details.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain

        Returns:
            HTTP response
        """
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Record start time
        start_time = time.time()

        # Extract request details
        method = request.method
        url = str(request.url)
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        # Log request start
        if settings.DEBUG:
            print(
                f"[{request_id}] START {method} {url} "
                f"from {client_host}"
            )

        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            # Calculate duration
            duration = time.time() - start_time

            # Log error
            print(
                f"[{request_id}] ERROR {method} {url} "
                f"duration={duration:.3f}s error={str(e)}"
            )
            raise

        # Calculate duration
        duration = time.time() - start_time

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{duration:.3f}"

        # Log request completion
        status_code = response.status_code
        log_level = "INFO" if status_code < 400 else "WARN" if status_code < 500 else "ERROR"

        if settings.DEBUG or status_code >= 400:
            print(
                f"[{request_id}] {log_level} {method} {url} "
                f"status={status_code} duration={duration:.3f}s "
                f"client={client_host}"
            )

        return response


def get_request_id(request: Request) -> str:
    """Get the request ID from the current request.

    Args:
        request: Current HTTP request

    Returns:
        Request ID string
    """
    return getattr(request.state, "request_id", str(uuid.uuid4()))
