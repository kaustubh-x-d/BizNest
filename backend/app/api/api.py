from fastapi import APIRouter
from backend.app.api.endpoints import auth, users, gis, analysis, reports

api_router = APIRouter()

# Include authentication endpoints with tag "Auth"
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# Include user management endpoints with tag "Users"
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# Include GIS and Location endpoints with tag "GIS"
api_router.include_router(gis.router, prefix="/gis", tags=["GIS"])

# Include Business Analysis and Scoring endpoints with tag "Analysis"
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])

# Include Saved Reports endpoints with tag "Reports"
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])



