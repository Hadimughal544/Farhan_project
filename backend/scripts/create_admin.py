"""Simple script to create an admin user.
Usage: python scripts/create_admin.py --email farhanadmin@gmail.com --password farhan1122
"""
import argparse
import sys

from app.database import SessionLocal, engine
from app.models.user import User
from app.auth.security import hash_password


def create_admin(email: str, password: str, full_name: str = "Administrator"):
    db = SessionLocal()
    try:
        # ensure tables exist
        from app.database import Base

        Base.metadata.create_all(bind=engine)

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User with email {email} already exists.")
            return

        user = User(full_name=full_name, email=email, password=hash_password(password), role="admin")
        db.add(user)
        db.commit()
        print("Admin created successfully.")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--name", default="Administrator")
    args = parser.parse_args()

    create_admin(args.email, args.password, args.name)


if __name__ == "__main__":
    main()
