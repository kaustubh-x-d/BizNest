from fastapi import APIRouter, Query, HTTPException, status
from typing import List, Dict, Any

from backend.app.services.gis import GISService

router = APIRouter()

@router.get("/geocode", response_model=List[Dict[str, Any]])
def geocode_address(q: str = Query(..., description="Location address search query (e.g. Kanpur, Kakadeo)")):
    """
    Search for locations and coordinates using OSM Nominatim.
    """
    if not q.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query string cannot be empty."
        )
    results = GISService.geocode_address(q)
    return results


@router.get("/competitors", response_model=List[Dict[str, Any]])
def get_competitors(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: float = Query(1000.0, description="Radius in meters"),
    business_type: str = Query(..., description="Business type (cafe, bakery, pharmacy, gym, kirana)")
):
    """
    Find nearby competitors for a business type within a specific radius.
    """
    valid_types = ["cafe", "bakery", "pharmacy", "gym", "kirana"]
    if business_type.lower() not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid business type. Must be one of {valid_types}"
        )
    competitors = GISService.search_nearby_competitors(lat, lon, radius, business_type)
    return competitors


@router.get("/amenities", response_model=Dict[str, List[Dict[str, Any]]])
def get_amenities(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: float = Query(1000.0, description="Radius in meters")
):
    """
    Find surrounding amenities (schools, universities, hospitals, parking, transit nodes) in a radius.
    """
    amenities = GISService.search_nearby_amenities(lat, lon, radius)
    return amenities
