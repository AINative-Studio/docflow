"""Main v1 API router for DocFlow HR."""

from fastapi import APIRouter

from app.config import settings


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


# Future routers will be included here:
# from app.api.v1.endpoints import auth, documents, employees, categories
# router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# router.include_router(documents.router, prefix="/documents", tags=["Documents"])
# router.include_router(employees.router, prefix="/employees", tags=["Employees"])
# router.include_router(categories.router, prefix="/categories", tags=["Categories"])
