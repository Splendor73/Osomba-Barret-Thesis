import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.database import SessionLocal

def add_enum_values():
    db = SessionLocal()
    try:
        # Add 'admin' and 'agent' to the userrole ENUM in PostgreSQL
        # The IF NOT EXISTS requires Postgres 9.3+
        db.execute(text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'admin'"))
        db.execute(text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'agent'"))
        db.commit()
        print("Successfully added 'admin' and 'agent' to userrole ENUM.")
    except Exception as e:
        db.rollback()
        print(f"Error adding enum values: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_enum_values()
