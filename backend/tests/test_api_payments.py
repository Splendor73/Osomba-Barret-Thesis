from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, UTC
from app.main import app
from app.api.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.order import PaymentProvider, PaymentStatus, Payment, Order, OrderItem
from app.models.product import Product
from app.schemas.product import ProductCreate
from app.crud import user as crud_user
from app.crud import product as crud_product
from app.crud import order as crud_order
from app.crud import payment as crud_payment
from app.schemas.order import OrderCreate, OrderItemCreate
from app.schemas.payment import PaymentInitiate, PaymentUpdate

client = TestClient(app)

# --- Mock Data and Fixtures ---

BUYER_USER_SUB_PAYMENT = "api-payment-buyer-sub"
ADMIN_USER_SUB_PAYMENT = "api-payment-admin-sub"

@pytest.fixture()
def test_users_for_payments(db_session: Session):
    """
    Fixture to create buyer and admin users for payment tests.
    """
    buyer = crud_user.create_user(db_session, email="payment_buyer@test.com", cognito_sub=BUYER_USER_SUB_PAYMENT, terms_version="v1", marketing_opt_in=False)
    buyer.role = UserRole.BUYER
    buyer.is_onboarded = True
    
    admin = crud_user.create_user(db_session, email="payment_admin@test.com", cognito_sub=ADMIN_USER_SUB_PAYMENT, terms_version="v1", marketing_opt_in=False)
    admin.role = UserRole.admin
    admin.is_onboarded = True
    
    db_session.commit()
    
    yield buyer, admin

    # Teardown
    db_session.delete(buyer)
    db_session.delete(admin)
    db_session.commit()

@pytest.fixture()
def authorized_buyer_client_payment(test_users_for_payments):
    """
    Client authenticated as a buyer.
    """
    buyer, _ = test_users_for_payments
    def override_dependency():
        return buyer
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_admin_client_payment(test_users_for_payments):
    """
    Client authenticated as an admin.
    """
    _, admin = test_users_for_payments
    def override_dependency():
        return admin
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def test_product_for_payment(db_session: Session, test_users_for_payments):
    """
    Fixture to create a product for an order related to payment.
    """
    _, admin = test_users_for_payments
    product_in = ProductCreate(
        title="Payable Product",
        description="A product to be paid for",
        quantity=5,
        price=25.00,
        product_listing_type="Buy it now"
    )
    
    product = crud_product.create_product(db_session, product=product_in, seller_id=admin.user_id)
    db_session.refresh(product)
    
    yield product
    
    # Teardown dependent order items first
    order_items = db_session.query(OrderItem).filter(OrderItem.product_id == product.product_id).all()
    if order_items:
        db_session.query(OrderItem).filter(OrderItem.product_id == product.product_id).delete(synchronize_session=False)
        db_session.commit()
        
    crud_product.delete_product(db_session, product_id=product.product_id)

@pytest.fixture()
def test_order_for_payment(db_session: Session, test_product_for_payment: Product, authorized_buyer_client_payment: TestClient):
    """
    Fixture to create an order for payment testing.
    """
    buyer_id = authorized_buyer_client_payment.app.dependency_overrides[get_current_user]().user_id
    
    order = crud_order.create_order_record(
        db_session,
        buyer_id=buyer_id,
        shipping_type="Shipping",
        shipping_address="789 Payment Rd",
        total_cost=25.00
    )
    crud_order.create_order_item(
        db_session,
        order_id=order.order_id,
        product_id=test_product_for_payment.product_id,
        quantity=1,
        price_of_item=25.00
    )
    db_session.commit()
    db_session.refresh(order)
    
    yield order
    
    # Teardown
    db_session.query(Payment).filter(Payment.order_id == order.order_id).delete(synchronize_session=False)
    db_session.query(OrderItem).filter(OrderItem.order_id == order.order_id).delete(synchronize_session=False)
    db_session.query(Order).filter(Order.order_id == order.order_id).delete(synchronize_session=False)
    db_session.commit()

@pytest.fixture
def mock_payment_service(test_order_for_payment: Order):
    """
    Mocks the PaymentService to prevent actual external API calls and uses
    dynamic data from the test order.
    """
    with patch("app.services.payment.service.PaymentService.initiate_payment", new_callable=AsyncMock) as mock_initiate, \
         patch("app.services.payment.service.PaymentService.verify_payment", new_callable=AsyncMock) as mock_verify:

        # Return a dictionary mimicking the Pydantic schema rather than an unmapped SQLAlchemy model
        mock_initiate.return_value = {
            "payment_id": 1, 
            "order_id": test_order_for_payment.order_id,
            "payment_type": PaymentProvider.STRIPE.value,
            "payment_amount": float(test_order_for_payment.total_cost),
            "currency": "USD",
            "payment_status": PaymentStatus.PENDING.value,
            "provider_transaction_id": "mock_txn_id",
            "metadata_json": {"url": "http://mock.url"},
            "created_at": datetime.now(UTC)
        }
        
        # The verify mock will be configured in the test itself
        mock_verify.return_value = None 

        yield {
            "initiate_payment": mock_initiate,
            "verify_payment": mock_verify
        }


# --- Test Cases ---

def test_initiate_payment_success(test_order_for_payment: Order, mock_payment_service, authorized_buyer_client_payment: TestClient):
    """
    Test initiating a payment successfully.
    """
    payment_initiate_data = {
        "order_id": test_order_for_payment.order_id,
        "payment_type": "STRIPE",
        "payment_amount": float(test_order_for_payment.total_cost),
        "currency": "USD"
    }
    response = authorized_buyer_client_payment.post("/api/v1/payments/initiate", json=payment_initiate_data)
    assert response.status_code == 200
    payment_response = response.json()
    assert payment_response["order_id"] == test_order_for_payment.order_id
    assert payment_response["payment_status"] == "PENDING"
    mock_payment_service["initiate_payment"].assert_called_once()

def test_verify_payment_success(db_session: Session, test_order_for_payment: Order, mock_payment_service, authorized_buyer_client_payment: TestClient):
    """
    Test verifying a payment successfully.
    """
    # First, create a payment record in the DB to verify
    db = db_session
    payment_data = PaymentInitiate(
        order_id=test_order_for_payment.order_id,
        payment_type=PaymentProvider.STRIPE,
        payment_amount=float(test_order_for_payment.total_cost),
        currency="USD"
    )
    created_payment_record = crud_payment.create_payment(db, payment=payment_data)
    
    # Configure the mock to return the created payment as a dict
    mock_payment_service['verify_payment'].return_value = {
        "payment_id": created_payment_record.payment_id,
        "order_id": created_payment_record.order_id,
        "payment_type": getattr(created_payment_record.payment_type, 'value', created_payment_record.payment_type),
        "payment_amount": float(created_payment_record.payment_amount),
        "currency": created_payment_record.currency,
        "payment_status": PaymentStatus.COMPLETED.value, # Simulate successful verification
        "provider_transaction_id": "mock_txn_id",
        "metadata_json": {"status": "completed"},
        "created_at": created_payment_record.created_at
    }

    response = authorized_buyer_client_payment.get(f"/api/v1/payments/verify/{created_payment_record.payment_id}")
    assert response.status_code == 200
    payment_response = response.json()
    assert payment_response["payment_id"] == created_payment_record.payment_id
    assert payment_response["payment_status"] == "COMPLETED"
    mock_payment_service["verify_payment"].assert_called_once()

def test_read_all_payments_as_admin(db_session: Session, test_order_for_payment: Order, authorized_admin_client_payment: TestClient):
    """
    Test retrieving all payments as an admin.
    """
    # Create a payment through CRUD to ensure it's in the DB for retrieval
    db = db_session
    payment_data = PaymentInitiate(
        order_id=test_order_for_payment.order_id,
        payment_type=PaymentProvider.PAYSTACK,
        payment_amount=float(test_order_for_payment.total_cost),
        currency="USD"
    )
    crud_payment.create_payment(db, payment=payment_data)

    response = authorized_admin_client_payment.get("/api/v1/payments/")
    assert response.status_code == 200
    payments = response.json()
    assert isinstance(payments, list)
    assert len(payments) >= 1 # At least one payment from setup or previous tests

def test_read_all_payments_as_buyer(authorized_buyer_client_payment: TestClient):
    """
    Test retrieving all payments as a buyer (should be forbidden).
    """
    response = authorized_buyer_client_payment.get("/api/v1/payments/")
    assert response.status_code == 403

def test_read_payment_by_id_as_admin(db_session: Session, test_order_for_payment: Order, authorized_admin_client_payment: TestClient):
    """
    Test retrieving a specific payment by ID as an admin.
    """
    db = db_session
    payment_data = PaymentInitiate(
        order_id=test_order_for_payment.order_id,
        payment_type=PaymentProvider.STRIPE,
        payment_amount=float(test_order_for_payment.total_cost),
        currency="USD"
    )
    created_payment = crud_payment.create_payment(db, payment=payment_data)

    response = authorized_admin_client_payment.get(f"/api/v1/payments/{created_payment.payment_id}")
    assert response.status_code == 200
    payment_response = response.json()
    assert payment_response["payment_id"] == created_payment.payment_id

def test_read_payment_by_id_as_buyer(db_session: Session, test_order_for_payment: Order, authorized_buyer_client_payment: TestClient):
    """
    Test retrieving a specific payment by ID as a buyer (should be forbidden).
    """
    db = db_session
    payment_data = PaymentInitiate(
        order_id=test_order_for_payment.order_id,
        payment_type=PaymentProvider.STRIPE,
        payment_amount=float(test_order_for_payment.total_cost),
        currency="USD"
    )
    created_payment = crud_payment.create_payment(db, payment=payment_data)

    response = authorized_buyer_client_payment.get(f"/api/v1/payments/{created_payment.payment_id}")
    assert response.status_code == 403

def test_update_payment_as_admin(db_session: Session, test_order_for_payment: Order, authorized_admin_client_payment: TestClient):
    """
    Test updating a payment as an admin.
    """
    db = db_session
    payment_data = PaymentInitiate(
        order_id=test_order_for_payment.order_id,
        payment_type=PaymentProvider.STRIPE,
        payment_amount=float(test_order_for_payment.total_cost),
        currency="USD"
    )
    created_payment = crud_payment.create_payment(db, payment=payment_data)

    update_data = {"payment_status": "COMPLETED", "provider_transaction_id": "new_mock_txn_id"}
    response = authorized_admin_client_payment.put(f"/api/v1/payments/{created_payment.payment_id}", json=update_data)
    assert response.status_code == 200
    updated_payment = response.json()
    assert updated_payment["payment_status"] == "COMPLETED"
    assert updated_payment["provider_transaction_id"] == "new_mock_txn_id"

def test_update_payment_as_buyer(db_session: Session, test_order_for_payment: Order, authorized_buyer_client_payment: TestClient):
    """
    Test updating a payment as a buyer (should be forbidden).
    """
    db = db_session
    payment_data = PaymentInitiate(
        order_id=test_order_for_payment.order_id,
        payment_type=PaymentProvider.STRIPE,
        payment_amount=float(test_order_for_payment.total_cost),
        currency="USD"
    )
    created_payment = crud_payment.create_payment(db, payment=payment_data)

    update_data = {"payment_status": "REFUNDED"}
    response = authorized_buyer_client_payment.put(f"/api/v1/payments/{created_payment.payment_id}", json=update_data)
    assert response.status_code == 403

def test_delete_payment_as_admin(db_session: Session, test_order_for_payment: Order, authorized_admin_client_payment: TestClient):
    """
    Test deleting a payment as an admin.
    """
    db = db_session
    payment_data = PaymentInitiate(
        order_id=test_order_for_payment.order_id,
        payment_type=PaymentProvider.STRIPE,
        payment_amount=float(test_order_for_payment.total_cost),
        currency="USD"
    )
    created_payment = crud_payment.create_payment(db, payment=payment_data)

    response = authorized_admin_client_payment.delete(f"/api/v1/payments/{created_payment.payment_id}")
    assert response.status_code == 200
    deleted_payment = response.json()
    assert deleted_payment["payment_id"] == created_payment.payment_id

    response = authorized_admin_client_payment.get(f"/api/v1/payments/{created_payment.payment_id}")
    assert response.status_code == 404

def test_delete_payment_as_buyer(db_session: Session, test_order_for_payment: Order, authorized_buyer_client_payment: TestClient):
    """
    Test deleting a payment as a buyer (should be forbidden).
    """
    db = db_session
    payment_data = PaymentInitiate(
        order_id=test_order_for_payment.order_id,
        payment_type=PaymentProvider.STRIPE,
        payment_amount=float(test_order_for_payment.total_cost),
        currency="USD"
    )
    created_payment = crud_payment.create_payment(db, payment=payment_data)

    response = authorized_buyer_client_payment.delete(f"/api/v1/payments/{created_payment.payment_id}")
    assert response.status_code == 403
