import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from backend.app.api import deps
from backend.app.core.config import settings
from backend.app.core.security import (
    ALGORITHM,
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from backend.app.models.user import User
from backend.app.schemas.token import Token, TokenPayload, TokenRefreshRequest
from backend.app.schemas.user import UserCreate, UserResponse, PasswordResetRequest
from backend.app.services.email import send_verification_email

router = APIRouter()

class ResendEmailRequest(BaseModel):
    email: EmailStr

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db)
):
    """
    Register a new user and queue a verification email.
    """
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email address already exists in the system.",
        )
        
    token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(hours=24)
        
    db_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        budget_tier=user_in.budget_tier,
        is_verified=False,
        verification_token=token,
        verification_expires=expires
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Queue background task to send verification link
    background_tasks.add_task(
        send_verification_email, 
        db_user.email, 
        token, 
        db_user.full_name
    )
    
    return db_user


@router.post("/login", response_model=Token)
def login(login_data: UserCreate, db: Session = Depends(deps.get_db)):
    """
    Standard JSON login API returning access & refresh tokens.
    Uses UserCreate for simple email/password mapping.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
        
    # Block if email is not verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email before logging in."
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/login-form", response_model=Token)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db)
):
    """
    OAuth2 compatible form login, returning access & refresh tokens.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
        
    # Block if email is not verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email before logging in."
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_data: TokenRefreshRequest, 
    db: Session = Depends(deps.get_db)
):
    """
    Refresh Access Token using a valid Refresh Token (Token Rotation).
    """
    try:
        payload = jwt.decode(
            refresh_data.refresh_token, 
            settings.REFRESH_SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        token_payload = TokenPayload(**payload)
        
        # Verify token is indeed a refresh token
        if token_payload.type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type, expected refresh token",
            )
            
    except (JWTError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
        
    user = db.query(User).filter(User.id == token_payload.sub).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/reset-password")
def reset_password(
    reset_data: PasswordResetRequest,
    db: Session = Depends(deps.get_db)
):
    """
    Verify identity using email and full_name, then reset password.
    """
    user = db.query(User).filter(User.email == reset_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email not found."
        )
    
    # Check if the full name matches (case-insensitive check)
    if user.full_name.strip().lower() != reset_data.full_name.strip().lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identity verification failed. Registered name does not match."
        )
        
    user.password_hash = get_password_hash(reset_data.new_password)
    # Automatically verify email if they reset password successfully via this flow
    user.is_verified = True
    user.verification_token = None
    user.verification_expires = None
    
    db.add(user)
    db.commit()
    return {"success": True, "message": "Password reset successful."}


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(deps.get_db)):
    """
    Handle email verification link check.
    """
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token."
        )
        
    # Check expiry
    if user.verification_expires and user.verification_expires < datetime.utcnow().replace(tzinfo=user.verification_expires.tzinfo):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link has expired."
        )
        
    user.is_verified = True
    user.verification_token = None
    user.verification_expires = None
    db.add(user)
    db.commit()
    return {"success": True, "message": "Email verified successfully! You can now sign in."}


@router.post("/resend-verification")
def resend_verification(
    data: ResendEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db)
):
    """
    Resend verification email to user.
    """
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email not found."
        )
        
    if user.is_verified:
        return {"success": True, "message": "Email is already verified."}
        
    token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(hours=24)
    user.verification_token = token
    user.verification_expires = expires
    db.add(user)
    db.commit()
    
    # Queue background task to send verification link
    background_tasks.add_task(
        send_verification_email, 
        user.email, 
        token, 
        user.full_name
    )
    
    return {"success": True, "message": "Verification link has been resent."}
