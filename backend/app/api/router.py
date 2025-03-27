from fastapi import APIRouter
from .endpoints import auth, problems, submissions

api_router = APIRouter()

# Include auth endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Include problem endpoints
api_router.include_router(problems.router, prefix="/problems", tags=["problems"])

# Include submissions endpoint
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])

# Add other endpoint routers here 