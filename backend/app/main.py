from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.api import api_router
from backend.app.core.config import settings
from backend.app.core.exceptions import register_error_handlers

try:
    from backend.app.db.session import engine
    from backend.app.db.base_class import Base
    from backend.app.models.user import User
    from backend.app.models.saved_report import SavedReport
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Warning: Database initialization failed: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="BizNest Business Intelligence and Decision Support Platform API API documentation.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register global custom error handlers
register_error_handlers(app)

# Mount aggregated API endpoints
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def health_check():
    """
    Service health check endpoint.
    """
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

