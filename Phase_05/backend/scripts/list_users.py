import sys
import os
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.user import User

def list_users():
    db = SessionLocal()
    users = db.query(User).all()
    print(f"Total Users: {len(users)}")
    for user in users:
        print(f"ID: {user.user_id}, Email: {user.email}, Sub: {user.cognito_sub}, Terms: {user.terms_version}")
    db.close()

if __name__ == "__main__":
    list_users()
