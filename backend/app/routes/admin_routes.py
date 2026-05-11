from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.university import UniversityCreate, UniversityResponse, UniversityUpdate
from app.schemas.user import AdminBulkEmailRequest, AdminBulkEmailResponse, AdminUserRoleUpdate, UserResponse
from app.services.email_service import EmailService
from app.services.university_service import UniversityService
from app.services.user_service import UserService

router = APIRouter(prefix="/admin", tags=["Admin"])


def ensure_admin(user):
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")


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


@router.post("/universities", response_model=UniversityResponse)
def create_university(
    payload: UniversityCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user)
    try:
        uni = UniversityService.add_university(db, payload)
        return serialize_university(uni)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/universities", response_model=list[UniversityResponse])
def list_universities(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_admin(current_user)
    universities = UniversityService.list_universities(db)
    return [serialize_university(uni) for uni in universities]


@router.put("/universities/{university_id}", response_model=UniversityResponse)
def update_university(
    university_id: int,
    payload: UniversityUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user)
    try:
        uni = UniversityService.update_university(db, university_id, payload)
        if not uni:
            raise HTTPException(status_code=404, detail="University not found")
        return serialize_university(uni)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/universities/{university_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_university(
    university_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user)
    deleted = UniversityService.delete_university(db, university_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="University not found")


@router.get("/users", response_model=list[UserResponse])
def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_admin(current_user)
    return UserService.list_users(db)


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    payload: AdminUserRoleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user)
    user = UserService.update_user_role(db, user_id, payload.role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user)
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Admin cannot delete own account")
    deleted = UserService.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")


@router.post("/users/send-email", response_model=AdminBulkEmailResponse)
def send_bulk_email_to_users(
    payload: AdminBulkEmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user)

    if payload.send_to == "all":
        users = UserService.list_users(db)
    else:
        if not payload.user_ids:
            raise HTTPException(status_code=400, detail="Select at least one user")
        users = UserService.get_users_by_ids(db, payload.user_ids)

    recipient_emails = []
    skipped = 0
    for u in users:
        if not u.email:
            skipped += 1
            continue
        recipient_emails.append(u.email)

    if not recipient_emails:
        raise HTTPException(status_code=400, detail="No valid recipient emails found")

    EmailService.send_bulk_email(
        recipients=recipient_emails,
        subject=payload.subject,
        body=payload.body,
    )

    return {
        "recipients": len(recipient_emails),
        "subject": payload.subject,
        "skipped_users": skipped,
    }
