from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import pytest
from app.main import app
from app.api.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.product import Product
from app.schemas.product import ProductCreate
from app.crud import user as crud_user
from app.crud import product as crud_product

client = TestClient(app)

# --- Mock Data and Fixtures ---

SELLER_USER_SUB = "api-test-seller-sub"
ANOTHER_SELLER_SUB = "api-test-another-seller-sub"

@pytest.fixture()
def test_users_for_products(db_session: Session):
    """
    Fixture to create seller users for product tests.
    """
    subs_to_clean = [SELLER_USER_SUB, ANOTHER_SELLER_SUB]

    def clean_up():
        users = db_session.query(User).filter(User.cognito_sub.in_(subs_to_clean)).all()
        if not users:
            return
            
        user_ids = [u.user_id for u in users]
        
        # 1. Delete all products belonging to these test sellers first
        db_session.query(Product).filter(Product.seller_id.in_(user_ids)).delete(synchronize_session=False)
        
        # 2. Now safely delete the users
        db_session.query(User).filter(User.user_id.in_(user_ids)).delete(synchronize_session=False)
        db_session.commit()

    # Pre-test cleanup
    clean_up()

    seller_user = crud_user.create_user(db_session, email="seller@test.com", cognito_sub=SELLER_USER_SUB, terms_version="v1", marketing_opt_in=False)
    seller_user.role = UserRole.SELLER
    seller_user.is_onboarded = True
    
    another_seller_user = crud_user.create_user(db_session, email="another_seller@test.com", cognito_sub=ANOTHER_SELLER_SUB, terms_version="v1", marketing_opt_in=False)
    another_seller_user.role = UserRole.SELLER
    another_seller_user.is_onboarded = True
    
    db_session.commit()
    
    yield seller_user, another_seller_user

    # Post-test cleanup
    clean_up()

@pytest.fixture()
def authorized_seller_client(test_users_for_products):
    """
    Fixture that provides a TestClient authenticated as the primary seller.
    """
    seller_user, _ = test_users_for_products
    
    def override_dependency():
        return seller_user
    
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def another_seller_client(test_users_for_products):
    """
    Fixture that provides a TestClient authenticated as another seller.
    """
    _, another_seller_user = test_users_for_products
    
    def override_dependency():
        return another_seller_user
    
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def unauthenticated_client(db_session):
    """
    Fixture that provides an unauthenticated TestClient.
    """
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]
    yield TestClient(app)

@pytest.fixture()
def test_product(test_users_for_products, db_session: Session):
    """
    Fixture to create a product for testing.
    """
    seller_user, _ = test_users_for_products
    
    product_in = ProductCreate(
        title="Test Product",
        description="A test description",
        quantity=10,
        price=99.99,
        product_listing_type="Buy it now"
    )
    
    product = crud_product.create_product(db_session, product=product_in, seller_id=seller_user.user_id)
    db_session.refresh(product)
    
    yield product
    
    # Manual cleanup for this specific fixture product
    crud_product.delete_product(db_session, product_id=product.product_id)

# --- Test Cases ---

def test_create_product_success(authorized_seller_client: TestClient):
    """
    Test creating a product with an authenticated seller.
    """
    product_data = {
        "title": "New Product",
        "description": "A brand new item",
        "quantity": 5,
        "price": 150.00,
        "product_listing_type": "Auction"
    }
    response = authorized_seller_client.post("/api/v1/products/", json=product_data)
    
    assert response.status_code == 201
    created_product = response.json()
    assert created_product["title"] == product_data["title"]
    assert created_product["seller_id"] == authorized_seller_client.app.dependency_overrides[get_current_user]().user_id

def test_create_product_unauthenticated(unauthenticated_client: TestClient):
    """
    Test creating a product without authentication.
    """
    product_data = {
        "title": "Unauthorized Product",
        "description": "Should not be created",
        "quantity": 1,
        "price": 10.00
    }
    response = unauthenticated_client.post("/api/v1/products/", json=product_data)
    assert response.status_code == 401

def test_read_products(test_product: Product, unauthenticated_client: TestClient):
    """
    Test reading all products.
    """
    response = unauthenticated_client.get("/api/v1/products/")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    assert any(p["product_id"] == test_product.product_id for p in products)

def test_read_product_by_id(test_product: Product, unauthenticated_client: TestClient):
    """
    Test reading a single product by ID.
    """
    response = unauthenticated_client.get(f"/api/v1/products/{test_product.product_id}")
    assert response.status_code == 200
    product_data = response.json()
    assert product_data["product_id"] == test_product.product_id
    assert product_data["title"] == test_product.title

def test_read_product_not_found(unauthenticated_client: TestClient):
    """
    Test reading a non-existent product.
    """
    response = unauthenticated_client.get("/api/v1/products/999999")
    assert response.status_code == 404

def test_update_product_success(test_product: Product, authorized_seller_client: TestClient):
    """
    Test updating a product by its seller.
    """
    update_data = {"price": 120.00, "description": "Updated description"}
    response = authorized_seller_client.put(f"/api/v1/products/{test_product.product_id}", json=update_data)
    assert response.status_code == 200
    updated_product = response.json()
    assert updated_product["price"] == 120.00
    assert updated_product["description"] == "Updated description"

def test_update_product_unauthorized(test_product: Product, another_seller_client: TestClient):
    """
    Test updating a product by a different seller (unauthorized).
    """
    update_data = {"price": 130.00}
    response = another_seller_client.put(f"/api/v1/products/{test_product.product_id}", json=update_data)
    assert response.status_code == 403

def test_delete_product_success(test_product: Product, authorized_seller_client: TestClient):
    """
    Test deleting a product by its seller.
    """
    response = authorized_seller_client.delete(f"/api/v1/products/{test_product.product_id}")
    assert response.status_code == 200
    deleted_product = response.json()
    assert deleted_product["product_id"] == test_product.product_id
    
    # Verify it's actually deleted
    response = authorized_seller_client.get(f"/api/v1/products/{test_product.product_id}")
    assert response.status_code == 404

def test_delete_product_unauthorized(test_product: Product, another_seller_client: TestClient):
    """
    Test deleting a product by a different seller (unauthorized).
    """
    response = another_seller_client.delete(f"/api/v1/products/{test_product.product_id}")
    assert response.status_code == 403
