import sys, json
sys.path.insert(0, '.')
from app.services.prediction_service import PredictionService

PredictionService._initialized = False
try:
    PredictionService.initialize()
    data = {
        'matric_pct': 85,
        'inter_pct': 88,
        'entry_test_score': 80,
        'budget': 500000,
        'program': 'Computer Science',
        'university_tier': 1,
        'university_type': 'Private'
    }
    res = PredictionService.predict(data)
    print(json.dumps(res, indent=2))
except Exception as e:
    import traceback
    traceback.print_exc()
    print('ERROR:', str(e))
