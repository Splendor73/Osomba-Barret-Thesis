from sqlalchemy import text
from app.db.database import engine
from app.models.support import SUPPORT_SCHEMA

def upgrade_db():
    with engine.begin() as conn:
        # Add is_deleted to forum_topics
        try:
            conn.execute(text(f"ALTER TABLE {SUPPORT_SCHEMA}.forum_topics ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE NOT NULL"))
            conn.execute(text(f"ALTER TABLE {SUPPORT_SCHEMA}.forum_topics ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE"))
            print("Added is_deleted and deleted_at to forum_topics")
        except Exception as e:
            print("forum_topics alter failed (might already exist):", e)

        # Add is_deleted to forum_posts
        try:
            conn.execute(text(f"ALTER TABLE {SUPPORT_SCHEMA}.forum_posts ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE NOT NULL"))
            conn.execute(text(f"ALTER TABLE {SUPPORT_SCHEMA}.forum_posts ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE"))
            print("Added is_deleted and deleted_at to forum_posts")
        except Exception as e:
            print("forum_posts alter failed (might already exist):", e)

if __name__ == "__main__":
    upgrade_db()
