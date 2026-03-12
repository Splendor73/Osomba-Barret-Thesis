import sys
import os
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.user import User

def update_user():
    db = SessionLocal()
    user = db.query(User).filter(User.email == "yashu1129@gmail.com").first()
    if user:
        user.user_name = "yp1129"
        user.full_name = "Yashu Patel"
        db.commit()
        print(f"User {user.email} updated: user_name={user.user_name}, full_name={user.full_name}")
    else:
        print("User not found")
    db.close()

if __name__ == "__main__":
    update_user()
