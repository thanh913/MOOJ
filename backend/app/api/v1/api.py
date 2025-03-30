from fastapi import APIRouter

# Remove admin and auth imports and router includes
from .endpoints import problems, submissions # Keep only problems and submissions

api_router = APIRouter()

# Include problem endpoints
api_router.include_router(problems.router, prefix="/problems", tags=["problems"])
# Include submission endpoints
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])

# api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
# api_router.include_router(admin.router, prefix="/admin", tags=["admin"]) # If admin existed

@api_router.get("/ping", tags=["test"])
async def ping():
    """Simple endpoint to check if the API is responsive."""
    return {"ping": "pong!"} 