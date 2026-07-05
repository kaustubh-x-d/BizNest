from pydantic import BaseModel, Field

class ScoreRequest(BaseModel):
    business_type: str = Field(..., description="Type of business (e.g. cafe, pharmacy)")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    budget: float = Field(..., description="Investment budget in INR")
    radius: float = Field(1000.0, description="Analysis radius in meters")

class LocationItem(BaseModel):
    lat: float
    lon: float
    label: str

class CompareRequest(BaseModel):
    business_type: str = Field(..., description="Type of business (e.g. cafe, pharmacy)")
    budget: float = Field(..., description="Investment budget in INR")
    location_a: LocationItem
    location_b: LocationItem
    radius: float = Field(1000.0, description="Analysis radius in meters")
