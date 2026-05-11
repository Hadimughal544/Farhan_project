from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserLogin, UserProfileUpdate, UserRegister
from app.services.avatar_service import AvatarService


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
            gender=payload.gender or "unspecified",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        # generate DiceBear avatar and upload to Cloudinary (best-effort)
        try:
            avatar_url = AvatarService.generate_and_upload_from_name(payload.full_name, payload.gender)
            user.avatar_url = avatar_url
            db.commit()
            db.refresh(user)
        except Exception:
            # fail silently for now; user still registered without avatar
            pass
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

    @staticmethod
    def list_users(db: Session) -> list[User]:
        return db.query(User).order_by(User.created_at.desc()).all()

    @staticmethod
    def get_users_by_ids(db: Session, user_ids: list[int]) -> list[User]:
        if not user_ids:
            return []
        return db.query(User).filter(User.id.in_(user_ids)).all()

    @staticmethod
    def update_user_role(db: Session, user_id: int, role: str) -> User | None:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        user.role = role
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True
