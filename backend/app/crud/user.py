from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserUpdate
from datetime import datetime, UTC


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.user_id == user_id).first()


def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, email: str, cognito_sub: str, terms_version: str, marketing_opt_in: bool = False):
    user = User(
        cognito_sub=cognito_sub,
        email=email,
        is_onboarded=False,
        accepted_terms_at=datetime.now(UTC),
        terms_version=terms_version,
        marketing_opt_in=marketing_opt_in
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, user_update: UserUpdate):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if user:
        db.delete(user)
        db.commit()
    return user


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_phone(db: Session, phone: str):
    return db.query(User).filter(User.phone_number == phone).first()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.user_name == username).first()


def enable_2fa(db: Session, user_id: int, secret_key: str):
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        user.twofa_enabled = True
        user.twofa_secret_key = secret_key
        db.commit()
        db.refresh(user)
    return user


def disable_2fa(db: Session, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        user.twofa_enabled = False
        user.twofa_secret_key = None
        db.commit()
        db.refresh(user)
    return user


def onboard_user(db: Session, user: User, onboard_data):
    """
    Updates the user record with onboarding data and flips the is_onboarded flag.
    """
    user.full_name = onboard_data.full_name
    user.user_name = onboard_data.user_name
    user.phone_number = onboard_data.phone_number
    user.address = onboard_data.address
    user.city = onboard_data.city
    user.country = onboard_data.country
    user.bio = onboard_data.bio
    user.role = onboard_data.role
    user.is_onboarded = True
    
    # If the user object is already in the session, we just commit.
    # Otherwise, we merge it.
    if user not in db:
        user = db.merge(user)
    
    db.commit()
    db.refresh(user)
    return user
