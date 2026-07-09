import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator

# List of common disposable/temporary email domains to block
DISPOSABLE_DOMAINS = {
    "mailinator.com", "yopmail.com", "tempmail.com", "10minutemail.com",
    "temp-mail.org", "guerrillamail.com", "sharklasers.com", "dispostable.com",
    "getairmail.com", "maildrop.cc", "yopmail.fr", "yopmail.net", "cool.fr.nf",
    "jetable.org", "spambox.us", "trashmail.net", "mailnesia.com", "mailcatch.com",
    "tempmailaddress.com", "generator.email", "tempmail.co"
}

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    budget_tier: Optional[str] = None

class UserCreate(UserBase):
    password: str

    @field_validator("email")
    @classmethod
    def validate_no_temp_email(cls, v: str) -> str:
        domain = v.split("@")[-1].lower().strip()
        if domain in DISPOSABLE_DOMAINS:
            raise ValueError("Temporary/disposable email domains are not allowed.")
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    budget_tier: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_no_temp_email(cls, v: Optional[EmailStr]) -> Optional[EmailStr]:
        if v is None:
            return v
        domain = v.split("@")[-1].lower().strip()
        if domain in DISPOSABLE_DOMAINS:
            raise ValueError("Temporary/disposable email domains are not allowed.")
        return v

# Shared properties to return to client
class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    created_at: datetime

# Schema for recovery password reset
class PasswordResetRequest(BaseModel):
    email: EmailStr
    full_name: str
    new_password: str
