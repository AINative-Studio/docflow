"""Dependency injection for DocFlow HR API."""

from typing import Annotated, Optional

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings
from app.core.exceptions import AuthenticationError
from app.core.security import decode_token, verify_token_type
from app.db.zerodb_client import ZeroDBClient, get_zerodb_client


# Security scheme for JWT bearer tokens
security = HTTPBearer(auto_error=False)


async def get_db() -> ZeroDBClient:
    """Dependency to get ZeroDB client.

    Returns:
        ZeroDB client instance
    """
    return await get_zerodb_client()


async def get_request_id(request: Request) -> str:
    """Dependency to get request ID.

    Args:
        request: Current HTTP request

    Returns:
        Request ID string
    """
    return getattr(request.state, "request_id", "unknown")


async def get_current_user_optional(
    credentials: Annotated[
        Optional[HTTPAuthorizationCredentials], Depends(security)
    ] = None,
) -> Optional[dict]:
    """Get current user from JWT token if provided.

    Args:
        credentials: HTTP authorization credentials

    Returns:
        User data from token or None if not authenticated
    """
    if not credentials:
        return None

    try:
        payload = decode_token(credentials.credentials)
        if not verify_token_type(payload, "access"):
            return None
        return payload
    except AuthenticationError:
        return None


async def get_current_user(
    credentials: Annotated[
        Optional[HTTPAuthorizationCredentials], Depends(security)
    ] = None,
) -> dict:
    """Get current user from JWT token.

    Args:
        credentials: HTTP authorization credentials

    Returns:
        User data from token

    Raises:
        HTTPException: If not authenticated or token invalid
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_token(credentials.credentials)
        if not verify_token_type(payload, "access"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    """Get current active user.

    Args:
        current_user: Current user from token

    Returns:
        Current user data

    Raises:
        HTTPException: If user is inactive
    """
    if current_user.get("disabled"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return current_user


def require_role(required_roles: list[str]):
    """Create a dependency that requires specific roles.

    Args:
        required_roles: List of required role names

    Returns:
        Dependency function
    """

    async def role_checker(
        current_user: Annotated[dict, Depends(get_current_active_user)],
    ) -> dict:
        """Check if user has required role.

        Args:
            current_user: Current user data

        Returns:
            Current user data

        Raises:
            HTTPException: If user lacks required role
        """
        user_role = current_user.get("role", "")
        if user_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' not authorized. Required: {required_roles}",
            )
        return current_user

    return role_checker


# Type aliases for common dependencies
DBDep = Annotated[ZeroDBClient, Depends(get_db)]
RequestIdDep = Annotated[str, Depends(get_request_id)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]
CurrentUserOptionalDep = Annotated[Optional[dict], Depends(get_current_user_optional)]
ActiveUserDep = Annotated[dict, Depends(get_current_active_user)]
