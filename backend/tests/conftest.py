"""Pytest configuration and fixtures for DocFlow HR tests."""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.config import Settings, get_settings


def get_test_settings() -> Settings:
    """Get test settings with overrides."""
    return Settings(
        ENVIRONMENT="test",
        DEBUG=True,
        JWT_SECRET_KEY="test-secret-key-for-testing-only",
        ZERODB_API_KEY="test-api-key",
        ZERODB_PROJECT_ID="test-project",
    )


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_settings() -> Settings:
    """Fixture for test settings."""
    return get_test_settings()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Fixture for synchronous test client."""
    # Override settings for testing
    app.dependency_overrides[get_settings] = get_test_settings
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Fixture for asynchronous test client."""
    # Override settings for testing
    app.dependency_overrides[get_settings] = get_test_settings
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def mock_user_token() -> str:
    """Fixture for mock user JWT token."""
    from app.core.security import create_access_token

    return create_access_token(
        data={
            "sub": "test-user-id",
            "email": "test@example.com",
            "role": "employee",
        }
    )


@pytest.fixture
def mock_admin_token() -> str:
    """Fixture for mock admin JWT token."""
    from app.core.security import create_access_token

    return create_access_token(
        data={
            "sub": "admin-user-id",
            "email": "admin@example.com",
            "role": "admin",
        }
    )


@pytest.fixture
def auth_headers(mock_user_token: str) -> dict:
    """Fixture for authenticated request headers."""
    return {"Authorization": f"Bearer {mock_user_token}"}


@pytest.fixture
def admin_auth_headers(mock_admin_token: str) -> dict:
    """Fixture for admin authenticated request headers."""
    return {"Authorization": f"Bearer {mock_admin_token}"}
