import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import models *before* anything that might import `app` indirectly (like routers)
# This ensures the SQLAlchemy Base metadata knows about the models early.
from app.db import base_class # This imports Base
from app.db import models # This imports the model definitions

# Use the centralized settings from core.config
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine

# No need to call create_all here; handled by test setup/teardown or migrations

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Mathematical Online Open Judge API",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
# The settings object now handles parsing the origins correctly
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        # Use the parsed list directly from settings
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Root endpoint
@app.get("/")
async def root():
    # Use app name from settings
    return {"message": f"Welcome to {settings.APP_NAME}"}

# Health check endpoint (can be kept here or moved to an endpoint file)
@app.get("/health", tags=["health"])
async def health_check():
    # Basic health check, could be expanded later
    return {"status": "healthy"}

# Include the main API router with the configured prefix
# This import happens *after* models are known to Base
app.include_router(api_router, prefix=settings.API_V1_STR)

# Add other application setup like event handlers if needed
# Example:
# @app.on_event("startup")
# async def startup_event():
#     # Actions to perform on startup
#     pass

# Example startup event (uncomment and modify if needed)
# @app.on_event("startup")
# async def startup_event():
#     print("Starting up...")

# Example shutdown event (uncomment and modify if needed)
# @app.on_event("shutdown")
# async def shutdown_event():
#     print("Shutting down...")
