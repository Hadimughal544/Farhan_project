"""Run this script to add `gender` and `avatar_url` columns to the `users` table if missing.

Usage:
    python backend/scripts/add_user_avatar_columns.py
"""
from sqlalchemy import text
from app.config import settings
from sqlalchemy import create_engine


def main():
    db_url = settings.database_url
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("Checking/adding columns on users table...")
        # Add gender column
        conn.execute(
            text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(32) DEFAULT 'unspecified'"
            )
        )
        # Add avatar_url column
        conn.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512)")
        )
        conn.commit()
        print("Done — columns ensured. Restart the API if it's running.")


if __name__ == "__main__":
    main()
