import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"
session = requests.Session()

# Test data
test_email = "testuser@example.com"
test_password = "TestPassword123"

try:
    # Step 1: Register user
    print("1. Registering user...")
    register_response = session.post(f"{BASE_URL}/auth/register", json={
        "full_name": "Test User",
        "email": test_email,
        "password": test_password
    })
    
    if register_response.status_code == 201:
        print("   ✓ User registered successfully")
    elif "already registered" in register_response.text.lower():
        print("   ✓ User already exists (continuing)")
    else:
        print(f"   ⚠ Register response: {register_response.status_code}")
    
    # Step 2: Login
    print("\n2. Logging in...")
    login_response = session.post(f"{BASE_URL}/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        print(f"   ✓ Login successful")
        print(f"   Token: {token[:20]}...")
    else:
        print(f"   ✗ Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        exit(1)
    
    # Step 3: Test prediction endpoint
    print("\n3. Testing prediction endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    
    prediction_payload = {
        "matric_pct": 85,
        "inter_pct": 88,
        "entry_test_score": 80,
        "budget": 500000,
        "program": "Computer Science",
        "university_tier": 1,
        "university_type": "Private"
    }
    
    pred_response = session.post(
        f"{BASE_URL}/predictions/admission/suggest",
        json=prediction_payload,
        headers=headers
    )
    
    print(f"   Status: {pred_response.status_code}")
    
    if pred_response.status_code == 200:
        result = pred_response.json()
        print(f"   ✓ Prediction successful!")
        print(f"   - Prediction: {result['prediction']}")
        print(f"   - Confidence: {result['confidence']:.2%}")
        print(f"   - Eligibility Score: {result['input_data']['eligibility_score']}")
        print(f"   - Suggested Universities: {len(result.get('suggested_universities', []))} found")
        print(f"\n   Full response:")
        print(json.dumps(result, indent=2))
    else:
        print(f"   ✗ Prediction failed!")
        print(f"   Response: {pred_response.text}")
        
except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
