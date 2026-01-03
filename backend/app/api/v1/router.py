"""Main v1 API router for DocFlow HR."""

from fastapi import APIRouter

from app.config import settings
from app.api.routes.review import router as review_router


# Create v1 router
router = APIRouter(prefix="/v1")


@router.get("/")
async def v1_root():
    """V1 API root endpoint."""
    return {
        "message": "DocFlow HR API v1",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


# Include routers
router.include_router(review_router, prefix="/review", tags=["Review Workflow"])
