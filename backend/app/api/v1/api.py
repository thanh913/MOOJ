from fastapi import APIRouter

# Example: from .endpoints import auth, problems

api_router = APIRouter()

# Example: api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
# Example: api_router.include_router(problems.router, prefix="/problems", tags=["problems"])

@api_router.get("/ping", tags=["test"])
async def ping():
    """Simple endpoint to check if the API is responsive."""
    return {"ping": "pong!"} 