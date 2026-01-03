"""ZeroDB client for all database operations.

This module provides an async HTTP client wrapper for the ZeroDB API,
handling tables, vectors, events, files, and memory operations.
"""

import logging
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator, Optional

import httpx

from app.config import settings, Settings
from app.core.exceptions import (
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    DatabaseError,
    ExternalServiceError,
    NotFoundError,
    ValidationError,
)

logger = logging.getLogger(__name__)


class ZeroDBClient:
    """ZeroDB client for all database operations.

    This client provides async methods for interacting with the ZeroDB API,
    including table operations, vector search, event logging, file management,
    and memory storage.

    Attributes:
        base_url: The ZeroDB API base URL.
        project_id: The ZeroDB project identifier.
        timeout: Request timeout in seconds.

    Example:
        ```python
        client = ZeroDBClient()
        async with client:
            result = await client.table_query("employees", filters={"department": "Engineering"})
        ```
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        project_id: Optional[str] = None,
        timeout: Optional[int] = None,
    ) -> None:
        """Initialize the ZeroDB client.

        Args:
            base_url: ZeroDB API base URL. Defaults to settings.ZERODB_BASE_URL.
            api_key: ZeroDB API key (Bearer token). Defaults to settings.ZERODB_API_KEY.
            project_id: ZeroDB project ID. Defaults to settings.ZERODB_PROJECT_ID.
            timeout: HTTP request timeout in seconds. Defaults to settings.ZERODB_TIMEOUT.
        """
        self.base_url = (base_url or settings.ZERODB_BASE_URL).rstrip("/")
        self.api_key = api_key or settings.ZERODB_API_KEY
        self.project_id = project_id or settings.ZERODB_PROJECT_ID
        self.timeout = timeout or settings.ZERODB_TIMEOUT
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def _headers(self) -> dict[str, str]:
        """Get default headers for API requests."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-Project-ID": self.project_id,
        }

    async def __aenter__(self) -> "ZeroDBClient":
        """Enter async context manager."""
        await self.connect()
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Exit async context manager."""
        await self.close()

    async def connect(self) -> None:
        """Initialize the HTTP client connection.

        Creates an httpx.AsyncClient with configured timeout and headers.
        """
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers=self._headers,
                timeout=httpx.Timeout(self.timeout),
            )
            logger.info(f"ZeroDB client connected to {self.base_url}")

    async def close(self) -> None:
        """Close the HTTP client connection."""
        if self._client is not None and not self._client.is_closed:
            await self._client.aclose()
            self._client = None
            logger.info("ZeroDB client connection closed")

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create the HTTP client.

        Returns:
            The connected httpx.AsyncClient.
        """
        if self._client is None or self._client.is_closed:
            await self.connect()
        return self._client  # type: ignore

    async def _request(
        self,
        method: str,
        endpoint: str,
        *,
        json: Optional[dict[str, Any]] = None,
        params: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Make an HTTP request to the ZeroDB API.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE, PATCH).
            endpoint: API endpoint path.
            json: JSON body for the request.
            params: Query parameters.

        Returns:
            Parsed JSON response as a dictionary.

        Raises:
            DatabaseError: For any API errors.
            ExternalServiceError: For connection errors.
        """
        client = await self._get_client()
        # Database operations use /projects/{id}/database/... path
        url = f"/projects/{self.project_id}/database{endpoint}"

        try:
            logger.debug(f"ZeroDB request: {method} {url}")
            response = await client.request(
                method=method,
                url=url,
                json=json,
                params=params,
            )
            return self._handle_response(response)

        except httpx.TimeoutException as e:
            logger.error(f"ZeroDB request timeout: {e}")
            raise ExternalServiceError(
                message=f"Request to ZeroDB timed out after {self.timeout}s",
                service_name="ZeroDB",
            )

        except httpx.ConnectError as e:
            logger.error(f"ZeroDB connection error: {e}")
            raise ExternalServiceError(
                message=f"Failed to connect to ZeroDB API: {e}",
                service_name="ZeroDB",
            )

        except httpx.HTTPError as e:
            logger.error(f"ZeroDB HTTP error: {e}")
            raise ExternalServiceError(
                message=f"HTTP error occurred: {e}",
                service_name="ZeroDB",
            )

    def _handle_response(self, response: httpx.Response) -> dict[str, Any]:
        """Handle API response and raise appropriate exceptions.

        Args:
            response: The httpx Response object.

        Returns:
            Parsed JSON response.

        Raises:
            Various exceptions based on status code.
        """
        status_code = response.status_code

        # Parse response body
        try:
            data = response.json() if response.content else {}
        except Exception:
            data = {"raw": response.text}

        # Success responses
        if 200 <= status_code < 300:
            logger.debug(f"ZeroDB response: {status_code}")
            return data

        # Extract error details
        error_message = data.get("error", data.get("message", "Unknown error"))

        logger.warning(f"ZeroDB error response: {status_code} - {error_message}")

        # Map status codes to exceptions
        if status_code == 401:
            raise AuthenticationError(message=f"ZeroDB authentication failed: {error_message}")
        elif status_code == 403:
            raise AuthorizationError(message=f"ZeroDB access denied: {error_message}")
        elif status_code == 404:
            raise NotFoundError(message=f"Resource not found: {error_message}")
        elif status_code == 409:
            raise ConflictError(message=f"Resource conflict: {error_message}")
        elif status_code == 422:
            raise ValidationError(
                message=f"Validation failed: {error_message}",
                details=[data.get("details", {})] if data.get("details") else None,
            )
        elif status_code == 429:
            retry_after = response.headers.get("Retry-After", "unknown")
            raise ExternalServiceError(
                message=f"ZeroDB rate limit exceeded. Retry after: {retry_after}",
                service_name="ZeroDB",
            )
        elif status_code >= 500:
            raise ExternalServiceError(
                message=f"ZeroDB server error: {error_message}",
                service_name="ZeroDB",
            )
        else:
            raise DatabaseError(
                message=f"ZeroDB error ({status_code}): {error_message}",
                details=[data] if data else None,
            )

    # =========================================================================
    # Health Check
    # =========================================================================

    async def health_check(self) -> bool:
        """Check if ZeroDB is accessible.

        Returns:
            True if ZeroDB is healthy, False otherwise.
        """
        try:
            client = await self._get_client()
            response = await client.get("/health")
            return response.status_code == 200
        except httpx.RequestError:
            return False

    # =========================================================================
    # Table Operations
    # =========================================================================

    async def table_create(self, table_name: str, schema: dict[str, Any]) -> dict[str, Any]:
        """Create a new table with the specified schema.

        Args:
            table_name: Name of the table to create.
            schema: Table schema definition including columns and their types.

        Returns:
            Response containing table creation confirmation.

        Raises:
            ValidationError: If schema is invalid.
            ConflictError: If table already exists.

        Example:
            ```python
            schema = {
                "columns": [
                    {"name": "id", "type": "uuid", "primary_key": True},
                    {"name": "name", "type": "text", "nullable": False},
                    {"name": "email", "type": "text", "unique": True}
                ]
            }
            result = await client.table_create("employees", schema)
            ```
        """
        logger.info(f"Creating table: {table_name}")
        return await self._request(
            "POST",
            "/tables",
            json={"name": table_name, "schema": schema},
        )

    async def table_insert(
        self, table_name: str, rows: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Insert rows into a table.

        Args:
            table_name: Name of the target table.
            rows: List of row dictionaries to insert.

        Returns:
            Response containing inserted row count and IDs.

        Raises:
            NotFoundError: If table doesn't exist.
            ValidationError: If row data is invalid.

        Example:
            ```python
            rows = [
                {"name": "John Doe", "email": "john@example.com"},
                {"name": "Jane Smith", "email": "jane@example.com"}
            ]
            result = await client.table_insert("employees", rows)
            ```
        """
        logger.info(f"Inserting {len(rows)} rows into table: {table_name}")
        return await self._request(
            "POST",
            f"/tables/{table_name}/rows",
            json=rows[0] if len(rows) == 1 else {"rows": rows},
        )

    async def table_query(
        self,
        table_name: str,
        filters: Optional[dict[str, Any]] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """Query rows from a table with optional filters.

        Args:
            table_name: Name of the table to query.
            filters: Optional filter conditions (e.g., {"department": "Engineering"}).
            limit: Maximum number of rows to return (default: 100).
            offset: Number of rows to skip (default: 0).

        Returns:
            List of matching row dictionaries.

        Raises:
            NotFoundError: If table doesn't exist.

        Example:
            ```python
            employees = await client.table_query(
                "employees",
                filters={"department": "Engineering", "status": "active"},
                limit=50,
                offset=0
            )
            ```
        """
        logger.info(f"Querying table: {table_name} with filters: {filters}")
        params: dict[str, Any] = {"limit": limit, "offset": offset}
        body: dict[str, Any] = {}
        if filters:
            body["filters"] = filters

        response = await self._request(
            "POST",
            f"/tables/{table_name}/query",
            json=body,
            params=params,
        )
        return response.get("rows", response.get("data", []))

    async def table_update(
        self,
        table_name: str,
        filters: dict[str, Any],
        update: dict[str, Any],
    ) -> dict[str, Any]:
        """Update rows in a table matching the filters.

        Args:
            table_name: Name of the table to update.
            filters: Filter conditions to identify rows to update.
            update: Dictionary of column values to update.

        Returns:
            Response containing count of updated rows.

        Raises:
            NotFoundError: If table doesn't exist.
            ValidationError: If update data is invalid.

        Example:
            ```python
            result = await client.table_update(
                "employees",
                filters={"id": "abc-123"},
                update={"status": "inactive", "updated_at": "2024-01-15"}
            )
            ```
        """
        logger.info(f"Updating table: {table_name} with filters: {filters}")
        return await self._request(
            "PATCH",
            f"/tables/{table_name}/rows",
            json={"filters": filters, "update": update},
        )

    async def table_delete(
        self, table_name: str, filters: dict[str, Any]
    ) -> dict[str, Any]:
        """Delete rows from a table matching the filters.

        Args:
            table_name: Name of the table.
            filters: Filter conditions to identify rows to delete.

        Returns:
            Response containing count of deleted rows.

        Raises:
            NotFoundError: If table doesn't exist.

        Example:
            ```python
            result = await client.table_delete(
                "employees",
                filters={"status": "terminated", "termination_date": {"$lt": "2023-01-01"}}
            )
            ```
        """
        logger.info(f"Deleting from table: {table_name} with filters: {filters}")
        return await self._request(
            "DELETE",
            f"/tables/{table_name}/rows",
            json={"filters": filters},
        )

    # =========================================================================
    # Vector Operations
    # =========================================================================

    async def vector_upsert(
        self, namespace: str, vectors: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Upsert vectors into a namespace.

        Args:
            namespace: The vector namespace (collection).
            vectors: List of vector objects with id, values, and optional metadata.

        Returns:
            Response containing upserted vector count.

        Raises:
            ValidationError: If vector format is invalid.

        Example:
            ```python
            vectors = [
                {
                    "id": "doc-1",
                    "values": [0.1, 0.2, 0.3, ...],  # embedding vector
                    "metadata": {"title": "HR Policy", "category": "policies"}
                }
            ]
            result = await client.vector_upsert("documents", vectors)
            ```
        """
        logger.info(f"Upserting {len(vectors)} vectors to namespace: {namespace}")
        return await self._request(
            "POST",
            "/vectors/upsert",
            json={"vectors": vectors, "namespace": namespace},
        )

    async def vector_search(
        self,
        namespace: str,
        query_vector: list[float],
        limit: int = 10,
        threshold: float = 0.7,
    ) -> list[dict[str, Any]]:
        """Search for similar vectors.

        Args:
            namespace: The vector namespace to search.
            query_vector: Query embedding vector.
            limit: Maximum number of results (default: 10).
            threshold: Minimum similarity threshold (default: 0.7).

        Returns:
            List of matching vectors with similarity scores.

        Raises:
            ValidationError: If query vector is invalid.

        Example:
            ```python
            query_embedding = await get_embedding("employee benefits")
            results = await client.vector_search(
                "documents",
                query_vector=query_embedding,
                limit=5,
                threshold=0.8
            )
            for result in results:
                print(f"Match: {result['metadata']['title']} - Score: {result['score']}")
            ```
        """
        logger.info(f"Searching vectors in namespace: {namespace}")
        response = await self._request(
            "POST",
            "/vectors/search",
            json={
                "vector": query_vector,
                "namespace": namespace,
                "top_k": limit,
                "threshold": threshold,
            },
        )
        return response.get("matches", response.get("results", []))

    # =========================================================================
    # Event Operations (Audit)
    # =========================================================================

    async def event_create(
        self,
        event_type: str,
        entity_type: str,
        entity_id: str,
        actor_id: str,
        actor_type: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        """Create an audit event.

        Args:
            event_type: Type of event (e.g., "created", "updated", "deleted").
            entity_type: Type of entity affected (e.g., "employee", "document").
            entity_id: ID of the affected entity.
            actor_id: ID of the actor performing the action.
            actor_type: Type of actor (e.g., "user", "system").
            payload: Additional event data and context.

        Returns:
            Response containing created event ID and timestamp.

        Example:
            ```python
            result = await client.event_create(
                event_type="updated",
                entity_type="employee",
                entity_id="emp-123",
                actor_id="user-456",
                actor_type="user",
                payload={
                    "changes": {"salary": {"old": 50000, "new": 55000}},
                    "reason": "Annual review"
                }
            )
            ```
        """
        logger.info(f"Creating event: {event_type} for {entity_type}/{entity_id}")
        return await self._request(
            "POST",
            "/events",
            json={
                "type": event_type,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "actor_id": actor_id,
                "actor_type": actor_type,
                "data": payload,
            },
        )

    async def event_list(
        self,
        filters: Optional[dict[str, Any]] = None,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """List audit events with optional filters.

        Args:
            filters: Optional filter conditions (e.g., {"entity_type": "employee"}).
            limit: Maximum number of events to return (default: 100).

        Returns:
            List of event dictionaries.

        Example:
            ```python
            events = await client.event_list(
                filters={
                    "entity_type": "employee",
                    "entity_id": "emp-123",
                    "created_after": "2024-01-01"
                },
                limit=50
            )
            ```
        """
        logger.info(f"Listing events with filters: {filters}")
        params: dict[str, Any] = {"limit": limit}
        if filters:
            for key, value in filters.items():
                params[key] = value

        response = await self._request("GET", "/events", params=params)
        return response.get("events", response.get("data", []))

    # =========================================================================
    # File Operations
    # =========================================================================

    async def file_upload_url(
        self,
        file_name: str,
        content_type: str,
        folder: str = "",
    ) -> dict[str, Any]:
        """Get a pre-signed URL for file upload.

        Args:
            file_name: Name of the file to upload.
            content_type: MIME type of the file (e.g., "application/pdf").
            folder: Optional folder path for organization.

        Returns:
            Response containing upload URL, file ID, and expiration.

        Example:
            ```python
            result = await client.file_upload_url(
                file_name="employee_handbook.pdf",
                content_type="application/pdf",
                folder="documents/policies"
            )
            upload_url = result["upload_url"]
            file_id = result["file_id"]

            # Use httpx or another client to upload the file
            async with httpx.AsyncClient() as http:
                await http.put(upload_url, content=file_bytes)
            ```
        """
        logger.info(f"Getting upload URL for file: {file_name}")
        return await self._request(
            "POST",
            "/files",
            json={
                "filename": file_name,
                "content_type": content_type,
                "folder": folder if folder else None,
            },
        )

    async def file_download_url(
        self,
        file_id: str,
        expiration_seconds: int = 3600,
    ) -> dict[str, Any]:
        """Get a pre-signed URL for file download.

        Args:
            file_id: ID of the file to download.
            expiration_seconds: URL expiration time in seconds (default: 3600).

        Returns:
            Response containing download URL and expiration timestamp.

        Raises:
            NotFoundError: If file doesn't exist.

        Example:
            ```python
            result = await client.file_download_url(
                file_id="file-abc-123",
                expiration_seconds=7200  # 2 hours
            )
            download_url = result["download_url"]
            ```
        """
        logger.info(f"Getting download URL for file: {file_id}")
        return await self._request(
            "POST",
            f"/files/{file_id}/presigned-url",
            json={"expires_in": expiration_seconds, "operation": "download"},
        )

    # =========================================================================
    # Memory Operations
    # =========================================================================

    async def memory_store(
        self,
        content: str,
        role: str,
        session_id: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Store a memory item (conversation or context).

        Args:
            content: The text content to store.
            role: Role of the content creator (e.g., "user", "assistant", "system").
            session_id: Optional session identifier for grouping memories.
            metadata: Optional additional metadata.

        Returns:
            Response containing stored memory ID.

        Example:
            ```python
            result = await client.memory_store(
                content="The employee requested time off for December 25-31",
                role="user",
                session_id="chat-session-123",
                metadata={"employee_id": "emp-456", "request_type": "pto"}
            )
            ```
        """
        logger.info(f"Storing memory for session: {session_id}")
        return await self._request(
            "POST",
            "/memory",
            json={
                "content": content,
                "role": role,
                "session_id": session_id,
                "metadata": metadata or {},
            },
        )

    async def memory_search(
        self,
        query: str,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Search memories by semantic similarity.

        Args:
            query: Search query text.
            limit: Maximum number of results (default: 10).

        Returns:
            List of matching memory items with relevance scores.

        Example:
            ```python
            results = await client.memory_search(
                query="employee vacation requests",
                limit=5
            )
            for memory in results:
                print(f"Content: {memory['content']}")
                print(f"Score: {memory['score']}")
            ```
        """
        logger.info(f"Searching memories with query: {query[:50]}...")
        response = await self._request(
            "POST",
            "/memory/search",
            json={"query": query, "limit": limit},
        )
        return response.get("memories", response.get("results", []))


# =============================================================================
# Singleton and Dependency Injection
# =============================================================================

_client_instance: Optional[ZeroDBClient] = None


def get_zerodb_client() -> ZeroDBClient:
    """Get or create the singleton ZeroDB client instance.

    This function returns a cached client instance for reuse across
    the application. Use this for dependency injection in FastAPI.

    Returns:
        The ZeroDB client singleton instance.

    Example:
        ```python
        from fastapi import Depends
        from app.db.zerodb_client import get_zerodb_client, ZeroDBClient

        @app.get("/employees")
        async def list_employees(db: ZeroDBClient = Depends(get_zerodb_client)):
            return await db.table_query("employees")
        ```
    """
    global _client_instance
    if _client_instance is None:
        _client_instance = ZeroDBClient()
    return _client_instance


async def init_zerodb_client() -> ZeroDBClient:
    """Initialize the ZeroDB client and establish connection.

    Call this during application startup to validate configuration
    and establish the initial connection.

    Returns:
        The initialized and connected ZeroDB client.

    Example:
        ```python
        from contextlib import asynccontextmanager
        from fastapi import FastAPI
        from app.db.zerodb_client import init_zerodb_client, close_zerodb_client

        @asynccontextmanager
        async def lifespan(app: FastAPI):
            # Startup
            await init_zerodb_client()
            yield
            # Shutdown
            await close_zerodb_client()

        app = FastAPI(lifespan=lifespan)
        ```
    """
    client = get_zerodb_client()
    await client.connect()
    logger.info("ZeroDB client initialized successfully")
    return client


async def close_zerodb_client() -> None:
    """Close the ZeroDB client connection.

    Call this during application shutdown to gracefully close
    the HTTP client connection.
    """
    global _client_instance
    if _client_instance is not None:
        await _client_instance.close()
        _client_instance = None
        logger.info("ZeroDB client closed")


@asynccontextmanager
async def zerodb_client_context() -> AsyncGenerator[ZeroDBClient, None]:
    """Async context manager for ZeroDB client.

    Creates a new client instance for use within a context.
    Useful for testing or isolated operations.

    Yields:
        A connected ZeroDB client.

    Example:
        ```python
        async with zerodb_client_context() as client:
            await client.table_query("employees")
        # Client is automatically closed here
        ```
    """
    client = ZeroDBClient()
    try:
        await client.connect()
        yield client
    finally:
        await client.close()
