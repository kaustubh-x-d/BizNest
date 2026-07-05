import uuid
from datetime import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, ConfigDict

class SavedReportBase(BaseModel):
    title: str
    latitude: float
    longitude: float
    business_type: str
    budget: float

class SavedReportCreate(SavedReportBase):
    radius: float = 1000.0

class SavedReportResponse(SavedReportBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    score_breakdown: Dict[str, Any]
    recommendations: Dict[str, Any]
    competitors_metadata: List[Dict[str, Any]]
    created_at: datetime
