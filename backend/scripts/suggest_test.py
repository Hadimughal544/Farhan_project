import sys, json
sys.path.insert(0, '.')
from app.services.prediction_service import PredictionService
from app.services.university_service import UniversityService
from app.database import SessionLocal

PredictionService._initialized = False
try:
    PredictionService.initialize()
    
    # Test prediction
    data = {
        'matric_pct': 85,
        'inter_pct': 88,
        'entry_test_score': 80,
        'budget': 500000,
        'program': 'Computer Science',
        'university_tier': 1,
        'university_type': 'Private'
    }
    result = PredictionService.predict(data)
    
    # Test suggestion (with empty DB)
    db = SessionLocal()
    input_data = result.get("input_data", {})
    suggested = UniversityService.suggest_universities(
        db,
        input_data.get("program"),
        float(input_data.get("budget", 0)),
        float(input_data.get("eligibility_score", 0)),
        int(input_data.get("university_tier", 1)),
        input_data.get("university_type")
    )
    db.close()
    
    final = {**result, "suggested_universities": []}
    print(json.dumps(final, indent=2))
    print(f"\nSuggested universities: {len(suggested)}")
    
except Exception as e:
    import traceback
    traceback.print_exc()
    print('ERROR:', str(e))
