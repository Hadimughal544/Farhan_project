from fastapi import APIRouter, Depends, HTTPException, status
import logging

from app.auth.dependencies import get_current_user
from app.models.prediction_history import PredictionHistory
from app.models.user import User
from app.schemas.user import AdmissionPredictionRequest, AdmissionPredictionResponse
from app.services.prediction_service import PredictionService
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.university_service import UniversityService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predictions", tags=["Predictions"])

PREDICTION_TIER_MAP = {"high": 1, "medium": 2, "low": 3}


def _estimate_university_chance(eligibility_score: float, budget: float, predicted_tier: int, uni) -> float:
    merit_gap = abs(float(eligibility_score) - float(uni.merit))
    base = 100.0 - (merit_gap * 1.6)

    if budget >= float(uni.min_fee):
        base += 8.0
    elif budget < float(uni.min_fee):
        base -= 20.0

    if uni.tier == predicted_tier:
        base += 6.0

    if uni.is_admission_open:
        base += 4.0

    return round(max(5.0, min(98.0, base)), 2)


@router.post("/admission", response_model=AdmissionPredictionResponse)
async def predict_admission(
    payload: AdmissionPredictionRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Predict admission chances based on student details.
    Requires authentication.
    """
    try:
        logger.info(f"📊 Prediction request from {current_user.email}")
        logger.info(f"   Input: {payload.model_dump()}")
        result = PredictionService.predict(payload.model_dump())
        logger.info(f"   Result: {result['prediction']} (confidence: {result['confidence']:.2%})")
        return result
    except Exception as e:
        logger.error(f"   Error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))



@router.post("/admission/suggest")
def predict_and_suggest(
    payload: AdmissionPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        logger.info(f"🎓 Prediction+Suggest request from {current_user.email}")
        logger.info(f"   Input: {payload.model_dump()}")
        result = PredictionService.predict(payload.model_dump())
        logger.info(f"   Prediction: {result['prediction']} (confidence: {result['confidence']:.2%})")

        # Suggest universities based on program, tier, type, and prediction
        input_data = result.get("input_data", {})
        prediction_label = str(result.get("prediction", "")).strip().lower()
        predicted_tier = PREDICTION_TIER_MAP.get(prediction_label, 2)

        program = input_data.get("program")
        utype = input_data.get("university_type")

        suggested = UniversityService.suggest_universities(
            db,
            program,
            predicted_tier,
            utype,
            prediction_label,
        )
        logger.info(f"   Suggested {len(suggested)} universities (tier {predicted_tier} from {prediction_label} prediction)")

        eligibility_score = float(input_data.get("eligibility_score", 0))
        budget = float(input_data.get("budget", 0))

        suggested_payload = [
            {
                "id": u.id,
                "name": u.name,
                "city": u.city,
                "programs": [p.strip() for p in u.programs.split(",") if p.strip()],
                "min_fee": u.min_fee,
                "max_fee": u.max_fee,
                "merit": u.merit,
                "type": u.type,
                "tier": u.tier,
                "is_scholarships": u.is_scholarships,
                "is_admission_open": u.is_admission_open,
                "admission_probability": _estimate_university_chance(eligibility_score, budget, predicted_tier, u),
            }
            for u in suggested
        ]

        safe_universities = [u for u in suggested_payload if u["admission_probability"] >= 75]
        moderate_universities = [u for u in suggested_payload if 50 <= u["admission_probability"] < 75]
        dream_universities = [u for u in suggested_payload if u["admission_probability"] < 50]

        history_record = PredictionHistory(
            user_id=current_user.id,
            prediction_label=result.get("prediction", ""),
            chance_percent=float(result.get("chance_percent", 0)),
            payload={
                "input_data": result.get("input_data", {}),
                "predicted_tier": predicted_tier,
                "safe_count": len(safe_universities),
                "moderate_count": len(moderate_universities),
                "dream_count": len(dream_universities),
            },
        )
        db.add(history_record)
        db.commit()

        return {
            **result,
            "predicted_tier": predicted_tier,
            "suggested_universities": suggested_payload,
            "safe_universities": safe_universities,
            "moderate_universities": moderate_universities,
            "dream_universities": dream_universities,
        }
    except Exception as e:
        logger.error(f"   Error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
