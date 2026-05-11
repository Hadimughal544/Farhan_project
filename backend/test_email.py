"""Test script to verify bulk email feature is working"""
import requests
from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.user import User
from app.auth.security import create_access_token
import time

# Wait for backend to be ready
time.sleep(1)

# Get database connection
engine = create_engine(settings.database_url)
session = Session(engine)

# Get first admin user
admin = session.query(User).filter(User.role == 'admin').first()

if not admin:
    print("❌ No admin user found")
    exit(1)

token = create_access_token(subject=admin.email)

# Get all users for testing
users = session.query(User).all()
user_count = len(users)
user_list = [u.email for u in users]

print("\n" + "="*80)
print("📧 BULK EMAIL FEATURE TEST")
print("="*80)
print(f"✅ Found {user_count} users in database:")
for email in user_list:
    print(f"   • {email}")

# Send test email to all users
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
payload = {
    'send_to': 'all',
    'user_ids': [],
    'subject': '🎉 Test: Welcome to Future Campus',
    'body': 'This is a test email. If you received this, the bulk email system is working correctly!'
}

print("\n📤 Sending test email to all users...")
response = requests.post('http://127.0.0.1:8000/api/v1/admin/users/send-email', json=payload, headers=headers)

if response.status_code == 200:
    data = response.json()
    print("\n✅ EMAIL TEST SUCCESSFUL!")
    print("="*80)
    print(f"Response Status: {response.status_code}")
    print(f"Recipients Processed: {data.get('recipients', 0)}")
    print(f"Users Skipped: {data.get('skipped_users', 0)}")
    print(f"Subject: {data.get('subject', 'N/A')}")
    print("="*80)
    print("\n📋 NEXT STEPS:")
    print("• Check the backend terminal logs above for email sending confirmations")
    print("• Each email should show 'EMAIL SENT SUCCESSFULLY' in the logs")
    print("• Backend is logging emails from: noreply admin@futurecampus")
    print("• This is a simulated email system - ready to integrate with SendGrid/Mailgun")
else:
    print(f"\n❌ ERROR: {response.status_code}")
    print(f"Response: {response.json()}")
