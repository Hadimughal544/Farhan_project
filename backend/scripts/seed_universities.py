"""
Seed script to populate Pakistani universities into the database.
Usage: python scripts/seed_universities.py
"""

import sys
sys.path.insert(0, ".")

from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models.university import University

# Clear existing universities (optional - comment out to keep)
def clear_universities():
    session = SessionLocal()
    try:
        session.query(University).delete()
        session.commit()
        print("✓ Cleared existing universities")
    finally:
        session.close()

def seed_universities():
    """Add Pakistani universities to database"""
    universities_data = [
        {
            "name": "National University of Sciences & Technology (NUST)",
            "city": "Islamabad",
            "programs": "Computer Science,Data Science,Electrical Engineering,Mechanical Engineering",
            "min_fee": 480000,
            "max_fee": 720000,
            "merit": 96,
            "tier": 1,
            "type": "Government",
            "is_scholarships": False,
            "is_admission_open": True,
        },
        {
            "name": "Quaid-i-Azam University (QAU)",
            "city": "Islamabad",
            "programs": "Computer Science,Economics,Psychology,LLB",
            "min_fee": 60000,
            "max_fee": 90000,
            "merit": 94,
            "tier": 1,
            "type": "Government",
            "is_scholarships": True,
            "is_admission_open": True,
        },
        {
            "name": "University of the Punjab (PU)",
            "city": "Lahore",
            "programs": "Computer Science,BBA,Economics,Psychology,LLB",
            "min_fee": 40000,
            "max_fee": 70000,
            "merit": 89,
            "tier": 2,
            "type": "Government",
            "is_scholarships": True,
            "is_admission_open": True,
        },
        {
            "name": "Institute of Business Administration (IBA)",
            "city": "Karachi",
            "programs": "BBA,Economics,Marketing,Computer Science,Data Science,Artificial Intelligence",
            "min_fee": 900000,
            "max_fee": 1400000,
            "merit": 94,
            "tier": 1,
            "type": "Private",
            "is_scholarships": False,
            "is_admission_open": True,
        },
        {
            "name": "Lahore University of Management Sciences (LUMS)",
            "city": "Lahore",
            "programs": "BBA,Economics,Marketing",
            "min_fee": 800000,
            "max_fee": 1200000,
            "merit": 93,
            "tier": 1,
            "type": "Private",
            "is_scholarships": True,
            "is_admission_open": True,
        },
        {
            "name": "National University of Computer & Emerging Sciences (FAST-NUCES)",
            "city": "Multiple Cities",
            "programs": "Computer Science,Software Engineering,Data Science,Artificial Intelligence",
            "min_fee": 500000,
            "max_fee": 700000,
            "merit": 90,
            "tier": 1,
            "type": "Private",
            "is_scholarships": True,
            "is_admission_open": True,
        },
        {
            "name": "Bahauddin Zakariya University (BZU)",
            "city": "Multan",
            "programs": "Computer Science,BBA,LLB,Agriculture",
            "min_fee": 35000,
            "max_fee": 60000,
            "merit": 77,
            "tier": 3,
            "type": "Government",
            "is_scholarships": False,
            "is_admission_open": True,
        },
        {
            "name": "Ghulam Ishaq Khan Institute (GIKI)",
            "city": "Topi",
            "programs": "Computer Science,Electrical Engineering,Mechanical Engineering",
            "min_fee": 600000,
            "max_fee": 900000,
            "merit": 92,
            "tier": 1,
            "type": "Private",
            "is_scholarships": True,
            "is_admission_open": True,
        },
        {
            "name": "University of Management & Technology (UMT)",
            "city": "Lahore",
            "programs": "Computer Science,BBA,Psychology,Media Studies",
            "min_fee": 400000,
            "max_fee": 600000,
            "merit": 88,
            "tier": 2,
            "type": "Private",
            "is_scholarships": True,
            "is_admission_open": True,
        },
        {
            "name": "Baqai Medical University",
            "city": "Karachi",
            "programs": "Food Science,Psychology",
            "min_fee": 300000,
            "max_fee": 600000,
            "merit": 70,
            "tier": 3,
            "type": "Private",
            "is_scholarships": False,
            "is_admission_open": True,
        },
    ]

    session = SessionLocal()
    try:
        # Create table if it doesn't exist
        Base.metadata.create_all(bind=engine)
        
        for uni_data in universities_data:
            # Check if university already exists
            existing = session.query(University).filter_by(name=uni_data["name"]).first()
            if existing:
                print(f"⊘ {uni_data['name']} already exists (skipping)")
                continue
            
            university = University(**uni_data)
            session.add(university)
            print(f"✓ Adding: {uni_data['name']}")
        
        session.commit()
        print(f"\n✅ Successfully seeded {len(universities_data)} universities!")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error seeding universities: {str(e)}")
    finally:
        session.close()

if __name__ == "__main__":
    print("🌱 Seeding Pakistani Universities...\n")
    clear_universities()
    seed_universities()
