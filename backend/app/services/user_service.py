from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserLogin, UserProfileUpdate, UserRegister


class UserService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def register_user(db: Session, payload: UserRegister) -> User:
        existing_user = UserService.get_user_by_email(db, payload.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered",
            )

        user = User(
            full_name=payload.full_name,
            email=payload.email,
            password=hash_password(payload.password),
            role="student",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, payload: UserLogin) -> User:
        user = UserService.get_user_by_email(db, payload.email)
        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        return user

    @staticmethod
    def update_profile(db: Session, user: User, payload: UserProfileUpdate) -> User:
        existing_user = UserService.get_user_by_email(db, payload.email)
        if existing_user and existing_user.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered",
            )

        user.full_name = payload.full_name
        user.email = payload.email
        db.commit()
        db.refresh(user)
        return user
