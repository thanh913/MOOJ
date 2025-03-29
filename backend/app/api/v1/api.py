from fastapi import APIRouter
from .endpoints import problems, auth

api_router = APIRouter()

# Include problem endpoints
api_router.include_router(problems.router, prefix="/problems", tags=["problems"])
# Include auth endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

@api_router.get("/ping", tags=["test"])
async def ping():
    """Simple endpoint to check if the API is responsive."""
    return {"ping": "pong!"} 