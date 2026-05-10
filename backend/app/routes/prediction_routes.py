from fastapi import APIRouter, Depends, HTTPException, status
import logging

from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import AdmissionPredictionRequest, AdmissionPredictionResponse
from app.services.prediction_service import PredictionService
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.university_service import UniversityService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predictions", tags=["Predictions"])

PREDICTION_TIER_MAP = {"high": 1, "medium": 2, "low": 3}


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
            }
            for u in suggested
        ]

        return {**result, "predicted_tier": predicted_tier, "suggested_universities": suggested_payload}
    except Exception as e:
        logger.error(f"   Error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
