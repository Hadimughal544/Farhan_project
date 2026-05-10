import sys
sys.path.insert(0, '.')
from app.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Drop the incomplete universities table if it exists
        conn.execute(text("DROP TABLE IF EXISTS universities CASCADE"))
        conn.commit()
        print("✓ Dropped old universities table")
except Exception as e:
    print(f"Note: {e}")

# Now create all tables (will recreate universities with all columns)
from app.database import Base
from app.models.university import University

Base.metadata.create_all(bind=engine)
print("✓ Created all tables including universities with full schema")
