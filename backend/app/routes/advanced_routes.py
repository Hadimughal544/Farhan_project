from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.merit_trend import MeritTrend
from app.models.prediction_history import PredictionHistory
from app.models.saved_university import SavedUniversity
from app.models.university import University
from app.models.user import User
from app.schemas.advanced import (
    CareerRecommendationRequest,
    CareerRecommendationResponse,
    MeritTrendCreate,
    MeritTrendResponse,
    RoadmapRequest,
    RoadmapResponse,
    SaveUniversityRequest,
    SavedUniversityResponse,
    ScholarshipRecommendationRequest,
    ScholarshipRecommendationResponse,
)
from app.services.advanced_service import AdvancedAdvisorService

router = APIRouter(prefix="/advanced", tags=["Advanced Features"])


def _serialize_university(uni: University) -> dict:
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


def _ensure_admin(user: User):
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")


@router.post("/scholarships/recommendations", response_model=list[ScholarshipRecommendationResponse])
def scholarship_recommendations(
    payload: ScholarshipRecommendationRequest,
    current_user: User = Depends(get_current_user),
):
    _ = current_user
    return AdvancedAdvisorService.scholarship_recommendations(payload)


@router.post("/career/recommend", response_model=CareerRecommendationResponse)
def career_recommendation(payload: CareerRecommendationRequest, current_user: User = Depends(get_current_user)):
    _ = current_user
    return AdvancedAdvisorService.career_recommendation(payload)


@router.post("/roadmap/generate", response_model=RoadmapResponse)
def generate_roadmap(payload: RoadmapRequest, current_user: User = Depends(get_current_user)):
    _ = current_user
    return AdvancedAdvisorService.roadmap(payload)


@router.post("/universities/compare")
def compare_universities(
    university_ids: list[int],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ = current_user
    if len(university_ids) < 2:
        raise HTTPException(status_code=400, detail="Select at least two universities to compare")

    universities = db.query(University).filter(University.id.in_(university_ids)).all()
    return [_serialize_university(u) for u in universities]


@router.get("/merit-trends", response_model=list[MeritTrendResponse])
def list_merit_trends(
    university_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ = current_user
    query = db.query(MeritTrend)
    if university_id is not None:
        query = query.filter(MeritTrend.university_id == university_id)
    trends = query.order_by(MeritTrend.year.asc()).all()

    university_map = {u.id: u.name for u in db.query(University).all()}
    return [
        {
            "id": t.id,
            "university_id": t.university_id,
            "university_name": university_map.get(t.university_id, "Unknown"),
            "year": t.year,
            "opening_merit": t.opening_merit,
            "closing_merit": t.closing_merit,
        }
        for t in trends
    ]


@router.post("/admin/merit-trends", response_model=MeritTrendResponse)
def create_merit_trend(
    payload: MeritTrendCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)

    uni = db.query(University).filter(University.id == payload.university_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")

    existing = (
        db.query(MeritTrend)
        .filter(MeritTrend.university_id == payload.university_id, MeritTrend.year == payload.year)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Merit trend for this year already exists")

    trend = MeritTrend(
        university_id=payload.university_id,
        year=payload.year,
        opening_merit=payload.opening_merit,
        closing_merit=payload.closing_merit,
    )
    db.add(trend)
    db.commit()
    db.refresh(trend)

    return {
        "id": trend.id,
        "university_id": trend.university_id,
        "university_name": uni.name,
        "year": trend.year,
        "opening_merit": trend.opening_merit,
        "closing_merit": trend.closing_merit,
    }


@router.delete("/admin/merit-trends/{trend_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_merit_trend(
    trend_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    trend = db.query(MeritTrend).filter(MeritTrend.id == trend_id).first()
    if not trend:
        raise HTTPException(status_code=404, detail="Trend record not found")
    db.delete(trend)
    db.commit()


@router.post("/saved-universities", response_model=SavedUniversityResponse)
def save_university(
    payload: SaveUniversityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uni = db.query(University).filter(University.id == payload.university_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")

    existing = (
        db.query(SavedUniversity)
        .filter(SavedUniversity.user_id == current_user.id, SavedUniversity.university_id == payload.university_id)
        .first()
    )
    if existing:
        existing.note = payload.note.strip()
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "university_id": existing.university_id,
            "note": existing.note,
            "created_at": existing.created_at,
            "university_name": uni.name,
        }

    item = SavedUniversity(user_id=current_user.id, university_id=payload.university_id, note=payload.note.strip())
    db.add(item)
    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "university_id": item.university_id,
        "note": item.note,
        "created_at": item.created_at,
        "university_name": uni.name,
    }


@router.get("/saved-universities", response_model=list[SavedUniversityResponse])
def list_saved_universities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(SavedUniversity, University)
        .join(University, University.id == SavedUniversity.university_id)
        .filter(SavedUniversity.user_id == current_user.id)
        .order_by(SavedUniversity.created_at.desc())
        .all()
    )

    return [
        {
            "id": row.SavedUniversity.id,
            "university_id": row.SavedUniversity.university_id,
            "note": row.SavedUniversity.note,
            "created_at": row.SavedUniversity.created_at,
            "university_name": row.University.name,
        }
        for row in rows
    ]


@router.delete("/saved-universities/{saved_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_saved_university(
    saved_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = db.query(SavedUniversity).filter(SavedUniversity.id == saved_id, SavedUniversity.user_id == current_user.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Saved university not found")
    db.delete(row)
    db.commit()


@router.get("/prediction-history")
def prediction_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": row.id,
            "prediction_label": row.prediction_label,
            "chance_percent": row.chance_percent,
            "payload": row.payload,
            "created_at": row.created_at,
        }
        for row in rows
    ]


@router.get("/student-dashboard")
def student_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    saved_count = db.query(SavedUniversity.id).filter(SavedUniversity.user_id == current_user.id).count()
    history_count = db.query(PredictionHistory.id).filter(PredictionHistory.user_id == current_user.id).count()

    latest_history = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "saved_universities": saved_count,
        "prediction_history": history_count,
        "scholarship_status": "Eligible for evaluation" if history_count > 0 else "Start assessment to unlock",
        "application_deadlines": [
            "FAST - 15 Aug",
            "NUST - 10 Jul",
            "COMSATS - 25 Jul",
        ],
        "latest_predictions": [
            {
                "prediction_label": item.prediction_label,
                "chance_percent": item.chance_percent,
                "created_at": item.created_at,
            }
            for item in latest_history
        ],
    }
