from app.schemas.product import ProductCreate
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import pytest
from app.main import app
from app.api.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.social import Review
from app.crud import user as crud_user
from app.crud import product as crud_product
from app.crud import review as crud_review
from app.schemas.social import ReviewCreate, ReviewUpdate

client = TestClient(app)

# --- Mock Data and Fixtures ---

REVIEW_BUYER_SUB = "api-review-buyer-sub"
REVIEW_SELLER_SUB = "api-review-seller-sub"
REVIEW_ADMIN_SUB = "api-review-admin-sub"

@pytest.fixture()
def test_users_for_reviews(db_session: Session):
    """
    Fixture to create buyer, seller, and admin users for review tests.
    """
    subs_to_clean = [REVIEW_BUYER_SUB, REVIEW_SELLER_SUB, REVIEW_ADMIN_SUB]

    def clean_up():
        users = db_session.query(User).filter(User.cognito_sub.in_(subs_to_clean)).all()
        if not users:
            return
            
        user_ids = [u.user_id for u in users]
        
        # 1. Find products to delete their reviews first
        products = db_session.query(Product).filter(Product.seller_id.in_(user_ids)).all()
        product_ids = [p.product_id for p in products]
        
        if product_ids:
            db_session.query(Review).filter(Review.product_id.in_(product_ids)).delete(synchronize_session=False)
            db_session.query(Product).filter(Product.product_id.in_(product_ids)).delete(synchronize_session=False)
        
        # 2. Clean up any other reviews written by these test users
        db_session.query(Review).filter(Review.buyer_id.in_(user_ids)).delete(synchronize_session=False)

        # 3. Finally, delete the users safely
        db_session.query(User).filter(User.user_id.in_(user_ids)).delete(synchronize_session=False)
        db_session.commit()

    # Pre-test cleanup to catch stragglers from previous failed tests
    clean_up()

    buyer = crud_user.create_user(db_session, email="review_buyer@test.com", cognito_sub=REVIEW_BUYER_SUB, terms_version="v1")
    buyer.role = UserRole.BUYER
    buyer.is_onboarded = True
    
    seller = crud_user.create_user(db_session, email="review_seller@test.com", cognito_sub=REVIEW_SELLER_SUB, terms_version="v1")
    seller.role = UserRole.SELLER
    seller.is_onboarded = True

    admin = crud_user.create_user(db_session, email="review_admin@test.com", cognito_sub=REVIEW_ADMIN_SUB, terms_version="v1")
    admin.role = UserRole.admin
    admin.is_onboarded = True
    
    db_session.commit()
    
    yield buyer, seller, admin

    # Post-test cleanup
    clean_up()

@pytest.fixture()
def authorized_buyer_client_review(test_users_for_reviews):
    """
    Client authenticated as a buyer.
    """
    buyer, _, _ = test_users_for_reviews
    def override_dependency():
        return buyer
    app.dependency_overrides[get_current_user] = override_dependency
    yield client
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_seller_client_review(test_users_for_reviews):
    """
    Client authenticated as a seller.
    """
    _, seller, _ = test_users_for_reviews
    def override_dependency():
        return seller
    app.dependency_overrides[get_current_user] = override_dependency
    yield client
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_admin_client_review(test_users_for_reviews):
    """
    Client authenticated as an admin.
    """
    _, _, admin = test_users_for_reviews
    def override_dependency():
        return admin
    app.dependency_overrides[get_current_user] = override_dependency
    yield client
    app.dependency_overrides.clear()

@pytest.fixture()
def test_product_for_review(db_session: Session, test_users_for_reviews):
    """
    Fixture to create a product for a review.
    """
    _, seller, _ = test_users_for_reviews
    product_create = ProductCreate(
        title="Reviewable Product",
        description="A product to be reviewed",
        quantity=1,
        price=10.00,
        product_listing_type="Buy it now"
    )
    
    product = crud_product.create_product(db_session, product=product_create, seller_id=seller.user_id)
    db_session.refresh(product)
    
    yield product
    
    # Teardown dependent reviews first
    db_session.query(Review).filter(Review.product_id == product.product_id).delete(synchronize_session=False)
    db_session.commit()
    
    crud_product.delete_product(db_session, product_id=product.product_id)

@pytest.fixture()
def test_review(authorized_buyer_client_review: TestClient, test_product_for_review: Product, db_session: Session):
    """
    Fixture to create a review for testing.
    """
    review_data = ReviewCreate(product_id=test_product_for_review.product_id, rating=5, comment="Excellent!")
    review = crud_review.create_review(db_session, review=review_data, buyer_id=authorized_buyer_client_review.app.dependency_overrides[get_current_user]().user_id)
    db_session.refresh(review)
    yield review
    crud_review.delete_review(db_session, review_id=review.review_id)

# --- Test Cases ---

def test_create_review_success(test_product_for_review: Product, authorized_buyer_client_review: TestClient):
    """
    Test creating a review successfully.
    """
    review_data = {
        "product_id": test_product_for_review.product_id,
        "rating": 4,
        "comment": "Very good product."
    }
    response = authorized_buyer_client_review.post("/api/v1/reviews/", json=review_data)
    assert response.status_code == 201
    created_review = response.json()
    assert created_review["rating"] == 4
    assert created_review["product_id"] == test_product_for_review.product_id
    assert created_review["buyer_id"] == authorized_buyer_client_review.app.dependency_overrides[get_current_user]().user_id

def test_read_product_reviews(test_review: dict, authorized_buyer_client_review: TestClient):
    """
    Test reading reviews for a product.
    """
    response = authorized_buyer_client_review.get(f"/api/v1/reviews/product/{test_review.product_id}")
    assert response.status_code == 200
    reviews = response.json()
    assert isinstance(reviews, list)
    assert any(r["review_id"] == test_review.review_id for r in reviews)

def test_read_seller_reviews(test_review: dict, authorized_buyer_client_review: TestClient):
    """
    Test reading reviews for a seller.
    """
    response = authorized_buyer_client_review.get(f"/api/v1/reviews/seller/{test_review.seller_id}")
    assert response.status_code == 200
    reviews = response.json()
    assert isinstance(reviews, list)
    assert any(r["review_id"] == test_review.review_id for r in reviews)

def test_read_review_by_id(test_review: dict, authorized_buyer_client_review: TestClient):
    """
    Test reading a single review by ID.
    """
    response = authorized_buyer_client_review.get(f"/api/v1/reviews/{test_review.review_id}")
    assert response.status_code == 200
    review_data = response.json()
    assert review_data["review_id"] == test_review.review_id

def test_update_review_as_author(test_review: dict, authorized_buyer_client_review: TestClient):
    """
    Test updating a review by its author.
    """
    update_data = {"rating": 3, "comment": "It's okay."}
    response = authorized_buyer_client_review.put(f"/api/v1/reviews/{test_review.review_id}", json=update_data)
    assert response.status_code == 200
    updated_review = response.json()
    assert updated_review["rating"] == 3
    assert updated_review["comment"] == "It's okay."

def test_update_review_unauthorized(test_review: dict, authorized_seller_client_review: TestClient):
    """
    Test updating a review by a different user.
    """
    update_data = {"rating": 1, "comment": "I didn't like it."}
    response = authorized_seller_client_review.put(f"/api/v1/reviews/{test_review.review_id}", json=update_data)
    assert response.status_code == 403

def test_delete_review_as_author(test_users_for_reviews, test_product_for_review, db_session, authorized_buyer_client_review: TestClient):
    """
    Test deleting a review by its author.
    """
    buyer, _, _ = test_users_for_reviews
    review_data = ReviewCreate(product_id=test_product_for_review.product_id, rating=2, comment="Temporary review.")
    review = crud_review.create_review(db_session, review=review_data, buyer_id=buyer.user_id)
    
    response = authorized_buyer_client_review.delete(f"/api/v1/reviews/{review.review_id}")
    assert response.status_code == 200
    
    # Verify deletion
    retrieved = crud_review.get_review_by_id(db_session, review.review_id)
    assert retrieved is None

def test_delete_review_as_admin(test_review: dict, authorized_admin_client_review: TestClient):
    """
    Test deleting a review by an admin.
    """
    response = authorized_admin_client_review.delete(f"/api/v1/reviews/{test_review.review_id}")
    assert response.status_code == 200

def test_delete_review_unauthorized(test_review: dict, authorized_seller_client_review: TestClient):
    """
    Test deleting a review by an unauthorized user.
    """
    response = authorized_seller_client_review.delete(f"/api/v1/reviews/{test_review.review_id}")
    assert response.status_code == 403
