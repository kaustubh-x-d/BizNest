import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    budget_tier: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    budget_tier: Optional[str] = None

# Shared properties to return to client
class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    created_at: datetime
