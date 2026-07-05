from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_user_me(current_user: User = Depends(deps.get_current_user)):
    """
    Get current logged in user details.
    This route is protected and requires a valid access token.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Update profile details for the current user.
    This route is protected.
    """
    if user_in.email is not None and user_in.email != current_user.email:
        # Check if the new email is already taken
        exists = db.query(User).filter(User.email == user_in.email).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered by another account."
            )
        current_user.email = user_in.email
        
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
        
    if user_in.budget_tier is not None:
        current_user.budget_tier = user_in.budget_tier
        
    if user_in.password is not None:
        current_user.password_hash = get_password_hash(user_in.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
