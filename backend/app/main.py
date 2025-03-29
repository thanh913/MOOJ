import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Use the centralized settings from core.config
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.base_class import Base
from app.db.session import engine
# Import models to register them with SQLAlchemy
from app.db.models import User, Problem
# Assuming env_validator is moved or its logic integrated elsewhere (e.g., in config)
# from app.core.env_validator import validate_env # Remove or update path if moved

# Validate environment variables (Consider integrating into Settings loading)
# if 'pytest' not in sys.modules:
#     validate_env() # Remove or update path if moved

# Create database tables only if not in testing mode
# Ensure Base is imported correctly and contains your models eventually
if 'pytest' not in sys.modules:
    # Make sure your models are imported somewhere before calling create_all
    # e.g., import app.db.models.user, app.db.models.problem etc.
    # This is often handled by importing the models into db.base or db.__init__
    Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Mathematical Online Open Judge API",
    version="0.1.0", # Consider making version dynamic or part of settings
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
