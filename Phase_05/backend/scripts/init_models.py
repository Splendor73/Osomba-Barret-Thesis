import sys
import os

sys.path.append(os.getcwd())

from app.db.database import engine, Base
from app.models.support import ForumCategory, ForumTopic, ForumPost, FAQ, AILog, SupportTicket
from app.models.user import User

def main():
    print("Creating all tables via SQLAlchemy...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    main()
