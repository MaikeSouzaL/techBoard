# ========================================
# RepairHub — Health Check Route
# ========================================

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "RepairHub Backend",
        "version": "1.0.0",
    }
