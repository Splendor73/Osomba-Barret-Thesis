from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import pytest
from app.main import app
from app.api.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.product import ProductCreate
from app.schemas.order import OrderCreate
from app.crud import user as crud_user
from app.crud import product as crud_product
from app.crud import order as crud_order
from app.schemas.order import OrderCreate, OrderItemCreate

client = TestClient(app)

# --- Mock Data and Fixtures ---

BUYER_USER_SUB = "api-order-buyer-sub"
ADMIN_USER_SUB_ORDER = "api-order-admin-sub"
OTHER_USER_SUB = "api-order-other-sub" # For unauthorized access tests

@pytest.fixture()
def test_users_for_orders(db_session: Session):
    """
    Fixture to create buyer and admin users for order tests.
    Includes a deep cleanup matching the structure of the auctions file to prevent Foreign Key violations.
    """
    subs_to_clean = [BUYER_USER_SUB, ADMIN_USER_SUB_ORDER, OTHER_USER_SUB]

    def clean_up():
        users = db_session.query(User).filter(User.cognito_sub.in_(subs_to_clean)).all()
        if not users:
            return
            
        user_ids = [u.user_id for u in users]
        
        # Find products to delete their dependent order items first
        products = db_session.query(Product).filter(Product.seller_id.in_(user_ids)).all()
        product_ids = [p.product_id for p in products]
        
        if product_ids:
            # Delete order items linked to these products before deleting the product
            db_session.query(OrderItem).filter(OrderItem.product_id.in_(product_ids)).delete(synchronize_session=False)
            # Now safe to delete the products
            db_session.query(Product).filter(Product.product_id.in_(product_ids)).delete(synchronize_session=False)
        
        # Also clean up any orders made by these users
        orders = db_session.query(Order).filter(Order.buyer_id.in_(user_ids)).all()
        order_ids = [o.order_id for o in orders]
        
        if order_ids:
            # Clear out any remaining order items tied to these orders
            db_session.query(OrderItem).filter(OrderItem.order_id.in_(order_ids)).delete(synchronize_session=False)
            # Safe to delete the orders
            db_session.query(Order).filter(Order.order_id.in_(order_ids)).delete(synchronize_session=False)

        # Finally, delete the users safely
        db_session.query(User).filter(User.user_id.in_(user_ids)).delete(synchronize_session=False)
        db_session.commit()

    # Pre-test cleanup in case a previous test failed abruptly
    clean_up()

    buyer = crud_user.create_user(db_session, email="order_buyer@test.com", cognito_sub=BUYER_USER_SUB, terms_version="v1", marketing_opt_in=False)
    buyer.role = UserRole.BUYER
    buyer.is_onboarded = True
    
    admin = crud_user.create_user(db_session, email="order_admin@test.com", cognito_sub=ADMIN_USER_SUB_ORDER, terms_version="v1", marketing_opt_in=False)
    admin.role = UserRole.admin
    admin.is_onboarded = True

    other_user = crud_user.create_user(db_session, email="other_order_user@test.com", cognito_sub=OTHER_USER_SUB, terms_version="v1", marketing_opt_in=False)
    other_user.role = UserRole.BUYER
    other_user.is_onboarded = True
    
    db_session.commit()
    
    # Refresh to match the auction fixture pattern
    db_session.refresh(buyer)
    db_session.refresh(admin)
    db_session.refresh(other_user)

    yield buyer, admin, other_user

    # Post-test cleanup
    clean_up()

@pytest.fixture()
def authorized_buyer_client(test_users_for_orders):
    """
    Client authenticated as a buyer.
    """
    buyer, _, _ = test_users_for_orders
    def override_dependency():
        return buyer
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_admin_client_order(test_users_for_orders):
    """
    Client authenticated as an admin.
    """
    _, admin, _ = test_users_for_orders
    def override_dependency():
        return admin
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_other_client(test_users_for_orders):
    """
    Client authenticated as another regular user, not the buyer or admin for specific tests.
    """
    _, _, other_user = test_users_for_orders
    def override_dependency():
        return other_user
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
def test_product_for_order(db_session: Session, test_users_for_orders):
    """
    Fixture to create a product for an order.
    """
    _, admin, _ = test_users_for_orders # Admin acts as seller for product creation
    product_in = ProductCreate(
        title="Orderable Product",
        description="A product to be ordered",
        quantity=10,
        price=50.00,
        product_listing_type="Buy it now"
    )
    
    product = crud_product.create_product(db_session, product=product_in, seller_id=admin.user_id)
    db_session.refresh(product)
    
    yield product
    
    # Teardown dependent order items first to match auction pattern
    order_items = db_session.query(OrderItem).filter(OrderItem.product_id == product.product_id).all()
    if order_items:
        db_session.query(OrderItem).filter(OrderItem.product_id == product.product_id).delete(synchronize_session=False)
        db_session.commit()
        
    crud_product.delete_product(db_session, product_id=product.product_id)

@pytest.fixture()
def test_order(db_session: Session, test_product_for_order: Product, test_users_for_orders):
    """
    Fixture to create an order for testing. 
    Using CRUD directly for setup is cleaner than the TestClient.
    """
    buyer, _, _ = test_users_for_orders
    
    order = crud_order.create_order_record(
        db_session,
        buyer_id=buyer.user_id,
        shipping_type="Shipping",
        shipping_address="123 Test St",
        total_cost=50.00
    )
    crud_order.create_order_item(
        db_session,
        order_id=order.order_id,
        product_id=test_product_for_order.product_id,
        quantity=1,
        price_of_item=50.00
    )
    db_session.commit()
    db_session.refresh(order)
    
    yield order

    # Explicitly clear out committed data (child first, then parent)
    db_session.query(OrderItem).filter(OrderItem.order_id == order.order_id).delete(synchronize_session=False)
    db_session.query(Order).filter(Order.order_id == order.order_id).delete(synchronize_session=False)
    db_session.commit()


# --- Test Cases ---

def test_checkout_success(test_product_for_order: Product, authorized_buyer_client: TestClient):
    """
    Test successful order checkout.
    """
    order_data = {
        "shipping_type": "Shipping",
        "shipping_address": "456 Test Ave",
        "items": [
            {"product_id": test_product_for_order.product_id, "quantity": 2}
        ]
    }
    response = authorized_buyer_client.post("/api/v1/orders/checkout", json=order_data)
    assert response.status_code == 201
    order_response = response.json()
    assert order_response["buyer_id"] == authorized_buyer_client.app.dependency_overrides[get_current_user]().user_id
    assert order_response["total_cost"] == 100.00 # 2 * 50.00
    assert order_response["shipping_status"] == "Pending"

def test_checkout_product_not_found(authorized_buyer_client: TestClient):
    """
    Test checkout with a non-existent product.
    """
    order_data = {
        "shipping_type": "Shipping",
        "shipping_address": "Non-existent Address",
        "items": [
            {"product_id": 999999, "quantity": 1}
        ]
    }
    response = authorized_buyer_client.post("/api/v1/orders/checkout", json=order_data)
    assert response.status_code == 404
    assert "Product 999999 not found" in response.json()["detail"]

def test_checkout_not_enough_stock(test_product_for_order: Product, authorized_buyer_client: TestClient):
    """
    Test checkout with insufficient product stock.
    """
    order_data = {
        "shipping_type": "Shipping",
        "shipping_address": "Stock Address",
        "items": [
            {"product_id": test_product_for_order.product_id, "quantity": 100} # Test product has 10
        ]
    }
    response = authorized_buyer_client.post("/api/v1/orders/checkout", json=order_data)
    assert response.status_code == 400
    assert "Not enough quantity" in response.json()["detail"]

def test_read_user_orders(test_order: Order, authorized_buyer_client: TestClient):
    """
    Test retrieving orders for the current user.
    """
    response = authorized_buyer_client.get("/api/v1/orders/my-orders")
    assert response.status_code == 200
    orders = response.json()
    assert isinstance(orders, list)
    assert any(o["order_id"] == test_order.order_id for o in orders)

def test_read_all_orders_as_admin(test_order: Order, authorized_admin_client_order: TestClient):
    """
    Test retrieving all orders as an admin.
    """
    response = authorized_admin_client_order.get("/api/v1/orders/")
    assert response.status_code == 200
    orders = response.json()
    assert isinstance(orders, list)
    assert any(o["order_id"] == test_order.order_id for o in orders)

def test_read_all_orders_as_buyer(authorized_buyer_client: TestClient):
    """
    Test retrieving all orders as a normal buyer (should be forbidden).
    """
    response = authorized_buyer_client.get("/api/v1/orders/")
    assert response.status_code == 403

def test_read_order_by_id_as_owner(test_order: Order, authorized_buyer_client: TestClient):
    """
    Test retrieving a specific order by ID as the order owner.
    """
    response = authorized_buyer_client.get(f"/api/v1/orders/{test_order.order_id}")
    assert response.status_code == 200
    order_data = response.json()
    assert order_data["order_id"] == test_order.order_id

def test_read_order_by_id_as_admin(test_order: Order, authorized_admin_client_order: TestClient):
    """
    Test retrieving a specific order by ID as an admin.
    """
    response = authorized_admin_client_order.get(f"/api/v1/orders/{test_order.order_id}")
    assert response.status_code == 200
    order_data = response.json()
    assert order_data["order_id"] == test_order.order_id

def test_read_order_by_id_unauthorized(test_order: Order, authorized_other_client: TestClient):
    """
    Test retrieving a specific order by ID as an unauthorized user.
    """
    response = authorized_other_client.get(f"/api/v1/orders/{test_order.order_id}")
    assert response.status_code == 403

def test_update_order_as_admin(test_order: Order, authorized_admin_client_order: TestClient):
    """
    Test updating an order's status as an admin.
    """
    update_data = {"shipping_status": "Shipped"}
    response = authorized_admin_client_order.put(f"/api/v1/orders/{test_order.order_id}", json=update_data)
    assert response.status_code == 200
    updated_order = response.json()
    assert updated_order["shipping_status"] == "Shipped"

def test_update_order_as_buyer(test_order: Order, authorized_buyer_client: TestClient):
    """
    Test updating an order as a buyer (should be forbidden).
    """
    update_data = {"shipping_status": "Delivered"}
    response = authorized_buyer_client.put(f"/api/v1/orders/{test_order.order_id}", json=update_data)
    assert response.status_code == 403

def test_delete_order_as_admin(test_order: Order, authorized_admin_client_order: TestClient):
    """
    Test deleting an order as an admin.
    """
    response = authorized_admin_client_order.delete(f"/api/v1/orders/{test_order.order_id}")
    assert response.status_code == 200
    deleted_order = response.json()
    assert deleted_order["order_id"] == test_order.order_id
    
    # Verify it's actually deleted
    response = authorized_admin_client_order.get(f"/api/v1/orders/{test_order.order_id}")
    assert response.status_code == 404

def test_delete_order_as_buyer(test_order: Order, authorized_buyer_client: TestClient):
    """
    Test deleting an order as a buyer (should be forbidden).
    """
    response = authorized_buyer_client.delete(f"/api/v1/orders/{test_order.order_id}")
    assert response.status_code == 403
