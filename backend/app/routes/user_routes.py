from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.university import UniversityResponse
from app.schemas.user import UserProfileUpdate, UserResponse
from app.services.university_service import UniversityService
from app.services.user_service import UserService
from app.services.avatar_service import AvatarService


router = APIRouter(prefix="/users", tags=["Users"])


def serialize_university(uni):
    return {
        "id": uni.id,
        "name": uni.name,
        "city": uni.city,
        "programs": [p.strip() for p in uni.programs.split(",") if p.strip()],
        "min_fee": uni.min_fee,
        "max_fee": uni.max_fee,
        "merit": uni.merit,
        "type": uni.type,
        "tier": uni.tier,
        "is_scholarships": uni.is_scholarships,
        "is_admission_open": uni.is_admission_open,
    }


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserService.update_profile(db, current_user, payload)


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contents = await file.read()
    try:
        url = AvatarService.upload_fileobj_to_cloudinary(contents, filename=file.filename)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    current_user.avatar_url = url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/universities", response_model=list[UniversityResponse])
async def list_universities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ = current_user
    universities = UniversityService.list_universities(db)
    return [serialize_university(uni) for uni in universities]
