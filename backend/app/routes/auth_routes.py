from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database import get_db
from app.schemas.user import TokenResponse, UserLogin, UserRegister, UserResponse
from app.services.user_service import UserService


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: Session = Depends(get_db)):
    user = UserService.register_user(db, payload)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = UserService.authenticate_user(db, payload)
    token = create_access_token(user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }
