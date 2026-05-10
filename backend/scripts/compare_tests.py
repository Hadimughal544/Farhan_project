import sys
sys.path.insert(0, '.')

# Test 1: Direct service test (what works in terminal)
print("=" * 60)
print("TEST 1: Direct PredictionService (Terminal Test)")
print("=" * 60)
from app.services.prediction_service import PredictionService

PredictionService._initialized = False
PredictionService.initialize()

test_data_1 = {
    'matric_pct': 85,
    'inter_pct': 88,
    'entry_test_score': 80,
    'budget': 500000,
    'program': 'Computer Science',
    'university_tier': 1,
    'university_type': 'Private'
}

result1 = PredictionService.predict(test_data_1)
print(f"Input: {test_data_1}")
print(f"Output: {result1['prediction']} (Confidence: {result1['confidence']:.2%})")
print(f"Eligibility: {result1['input_data']['eligibility_score']}")

# Test 2: Simulate what HTTP endpoint receives
print("\n" + "=" * 60)
print("TEST 2: With None values (what Pydantic might send)")
print("=" * 60)

test_data_2 = {
    'matric_pct': 85,
    'inter_pct': 88,
    'entry_test_score': 80,
    'eligibility_score': None,  # This might be different
    'budget': 500000,
    'program': 'Computer Science',
    'university_tier': 1,
    'university_type': 'Private'
}

result2 = PredictionService.predict(test_data_2)
print(f"Input: {test_data_2}")
print(f"Output: {result2['prediction']} (Confidence: {result2['confidence']:.2%})")
print(f"Eligibility: {result2['input_data']['eligibility_score']}")

# Test 3: Check if floating point issues
print("\n" + "=" * 60)
print("TEST 3: With float strings (type conversion)")
print("=" * 60)

test_data_3 = {
    'matric_pct': 85.0,
    'inter_pct': 88.0,
    'entry_test_score': 80.0,
    'eligibility_score': None,
    'budget': 500000.0,
    'program': 'Computer Science',
    'university_tier': 1,
    'university_type': 'Private'
}

result3 = PredictionService.predict(test_data_3)
print(f"Input: {test_data_3}")
print(f"Output: {result3['prediction']} (Confidence: {result3['confidence']:.2%})")
print(f"Eligibility: {result3['input_data']['eligibility_score']}")

# Compare all results
print("\n" + "=" * 60)
print("COMPARISON")
print("=" * 60)
print(f"Test 1 Result: {result1['prediction']}")
print(f"Test 2 Result: {result2['prediction']}")
print(f"Test 3 Result: {result3['prediction']}")
print(f"All match: {result1['prediction'] == result2['prediction'] == result3['prediction']}")
