from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import pytest
from app.main import app
from app.api.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.auction import Auction, Bid
from app.crud import user as crud_user
from app.crud import product as crud_product
from app.crud import auction as crud_auction
from app.schemas.product import ProductCreate
from datetime import datetime, timedelta, UTC

client = TestClient(app)

# --- Mock Data and Fixtures ---

AUCTION_SELLER_SUB = "api-auction-seller-sub"
AUCTION_BIDDER_SUB = "api-auction-bidder-sub"
AUCTION_OTHER_USER_SUB = "api-auction-other-sub"

@pytest.fixture()
def test_users_for_auctions(db_session: Session):
    """
    Fixture to create seller and bidder users for auction tests.
    """
    subs_to_clean = [AUCTION_SELLER_SUB, AUCTION_BIDDER_SUB, AUCTION_OTHER_USER_SUB]

    def clean_up():
        users = db_session.query(User).filter(User.cognito_sub.in_(subs_to_clean)).all()
        if not users:
            return
            
        user_ids = [u.user_id for u in users]
        
        # Find products to delete their auctions and bids first
        products = db_session.query(Product).filter(Product.seller_id.in_(user_ids)).all()
        product_ids = [p.product_id for p in products]
        
        if product_ids:
            auctions = db_session.query(Auction).filter(Auction.product_id.in_(product_ids)).all()
            auction_ids = [a.auction_id for a in auctions]
            
            if auction_ids:
                db_session.query(Bid).filter(Bid.auction_id.in_(auction_ids)).delete(synchronize_session=False)
                db_session.query(Auction).filter(Auction.auction_id.in_(auction_ids)).delete(synchronize_session=False)
            
            db_session.query(Product).filter(Product.product_id.in_(product_ids)).delete(synchronize_session=False)
        
        # Also clean up any other bids made by these users
        db_session.query(Bid).filter(Bid.bidder_id.in_(user_ids)).delete(synchronize_session=False)

        # Finally, delete the users safely
        db_session.query(User).filter(User.user_id.in_(user_ids)).delete(synchronize_session=False)
        db_session.commit()

    # Pre-test cleanup in case a previous test failed abruptly
    clean_up()

    seller = crud_user.create_user(db_session, email="auction_seller@test.com", cognito_sub=AUCTION_SELLER_SUB, terms_version="v1", marketing_opt_in=False)
    seller.role = UserRole.SELLER
    seller.is_onboarded = True
    
    bidder = crud_user.create_user(db_session, email="auction_bidder@test.com", cognito_sub=AUCTION_BIDDER_SUB, terms_version="v1", marketing_opt_in=False)
    bidder.role = UserRole.BUYER
    bidder.is_onboarded = True

    other_user = crud_user.create_user(db_session, email="auction_other@test.com", cognito_sub=AUCTION_OTHER_USER_SUB, terms_version="v1", marketing_opt_in=False)
    other_user.role = UserRole.BUYER
    other_user.is_onboarded = True
    
    db_session.commit()
    
    db_session.refresh(seller)
    db_session.refresh(bidder)
    db_session.refresh(other_user)

    yield seller, bidder, other_user

    # Post-test cleanup
    clean_up()

@pytest.fixture()
def unauthenticated_client(db_session):
    """
    Client without authentication to clear any lingering auth overrides.
    BUT leaves the db_session override intact.
    """
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]
    yield TestClient(app)

@pytest.fixture()
def authorized_auction_seller_client(test_users_for_auctions):
    """
    Client authenticated as the auction seller.
    """
    seller, _, _ = test_users_for_auctions
    def override_dependency():
        return seller
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_auction_bidder_client(test_users_for_auctions):
    """
    Client authenticated as the auction bidder.
    """
    _, bidder, _ = test_users_for_auctions
    def override_dependency():
        return bidder
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def authorized_auction_other_client(test_users_for_auctions):
    """
    Client authenticated as another user (not seller or primary bidder).
    """
    _, _, other_user = test_users_for_auctions
    def override_dependency():
        return other_user
    app.dependency_overrides[get_current_user] = override_dependency
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def test_product_for_auction(db_session: Session, test_users_for_auctions):
    """
    Fixture to create a product for an auction.
    """
    seller, _, _ = test_users_for_auctions
    product_create = ProductCreate(
        title="Auction Product",
        description="A product for auction",
        quantity=1,
        price=100.00,
        product_listing_type="Auction"
    )
    
    product = crud_product.create_product(db_session, product=product_create, seller_id=seller.user_id)
    
    db_session.refresh(product)
    yield product
    
    # Teardown dependent auctions and bids first
    auctions = db_session.query(Auction).filter(Auction.product_id == product.product_id).all()
    auction_ids = [a.auction_id for a in auctions]
    if auction_ids:
        db_session.query(Bid).filter(Bid.auction_id.in_(auction_ids)).delete(synchronize_session=False)
        db_session.query(Auction).filter(Auction.auction_id.in_(auction_ids)).delete(synchronize_session=False)
        db_session.commit()
        
    crud_product.delete_product(db_session, product_id=product.product_id)

@pytest.fixture()
def test_auction(authorized_auction_seller_client: TestClient, test_product_for_auction: Product, db_session: Session):
    """
    Fixture to create an auction for testing. Cleans up after the test.
    """
    auction_data = {
        "product_id": test_product_for_auction.product_id,
        "starting_bid": 10.00,
        "reserve_limit": 50.00,
        "end_time": (datetime.now(UTC) + timedelta(days=1)).isoformat()
    }
    response = authorized_auction_seller_client.post("/api/v1/auctions/", json=auction_data)
    assert response.status_code == 201
    auction_id = response.json()["auction_id"]
    
    yield auction_id
    
    # Explicitly clear out committed data
    db_session.query(Bid).filter(Bid.auction_id == auction_id).delete(synchronize_session=False)
    db_session.query(Auction).filter(Auction.auction_id == auction_id).delete(synchronize_session=False)
    db_session.commit()

# --- Test Cases ---

def test_create_auction_success(test_product_for_auction: Product, authorized_auction_seller_client: TestClient):
    """
    Test creating an auction successfully.
    """
    auction_data = {
        "product_id": test_product_for_auction.product_id,
        "starting_bid": 10.00,
        "reserve_limit": 50.00,
        "end_time": (datetime.now(UTC) + timedelta(days=1)).isoformat()
    }
    response = authorized_auction_seller_client.post("/api/v1/auctions/", json=auction_data)
    assert response.status_code == 201
    created_auction = response.json()
    assert created_auction["product_id"] == test_product_for_auction.product_id
    assert created_auction["seller_id"] == authorized_auction_seller_client.app.dependency_overrides[get_current_user]().user_id
    assert created_auction["status"] == "active"

def test_read_auctions(test_auction: int, unauthenticated_client: TestClient):
    """
    Test retrieving a list of auctions.
    """
    response = unauthenticated_client.get("/api/v1/auctions/")
    assert response.status_code == 200
    auctions = response.json()
    assert isinstance(auctions, list)
    assert any(a["auction_id"] == test_auction for a in auctions)

def test_read_auction_by_id(test_auction: int, unauthenticated_client: TestClient):
    """
    Test retrieving a single auction by ID.
    """
    response = unauthenticated_client.get(f"/api/v1/auctions/{test_auction}")
    assert response.status_code == 200
    auction_data = response.json()
    assert auction_data["auction_id"] == test_auction

def test_read_auction_not_found(unauthenticated_client: TestClient):
    """
    Test retrieving a non-existent auction.
    """
    response = unauthenticated_client.get("/api/v1/auctions/999999")
    assert response.status_code == 404

def test_update_auction_success(test_auction: int, authorized_auction_seller_client: TestClient):
    """
    Test updating an auction by its seller.
    """
    update_data = {"reserve_limit": 60.00}
    response = authorized_auction_seller_client.put(f"/api/v1/auctions/{test_auction}", json=update_data)
    assert response.status_code == 200
    updated_auction = response.json()
    assert updated_auction["reserve_limit"] == 60.00

def test_update_auction_unauthorized(test_auction: int, authorized_auction_other_client: TestClient):
    """
    Test updating an auction by a non-seller.
    """
    update_data = {"reserve_limit": 70.00}
    response = authorized_auction_other_client.put(f"/api/v1/auctions/{test_auction}", json=update_data)
    assert response.status_code == 403

def test_cancel_auction_success(test_auction: int, authorized_auction_seller_client: TestClient):
    """
    Test canceling an auction by its seller.
    """
    response = authorized_auction_seller_client.post(f"/api/v1/auctions/{test_auction}/cancel")
    assert response.status_code == 200
    cancelled_auction = response.json()
    assert cancelled_auction["status"] == "cancelled"

def test_cancel_auction_unauthorized(test_auction: int, authorized_auction_other_client: TestClient):
    """
    Test canceling an auction by a non-seller.
    """
    response = authorized_auction_other_client.post(f"/api/v1/auctions/{test_auction}/cancel")
    assert response.status_code == 403

def test_place_bid_success(test_auction: int, authorized_auction_bidder_client: TestClient):
    """
    Test placing a bid successfully.
    """
    bid_data = {"bid_amount": 15.00, "max_bid": 20.00}
    response = authorized_auction_bidder_client.post(f"/api/v1/auctions/{test_auction}/bid", json=bid_data)
    assert response.status_code == 200
    bid = response.json()
    assert bid["bid_amount"] == 10.00
    assert bid["bidder_id"] == authorized_auction_bidder_client.app.dependency_overrides[get_current_user]().user_id

def test_place_bid_too_low(test_auction: int, authorized_auction_bidder_client: TestClient):
    """
    Test placing a bid lower than the minimum required.
    """
    bid_data = {"bid_amount": 5.00, "max_bid": 5.00} # Starting bid was 10.00
    response = authorized_auction_bidder_client.post(f"/api/v1/auctions/{test_auction}/bid", json=bid_data)
    assert response.status_code == 400
    assert "Bid must be at least" in response.json()["detail"]

def test_place_bid_on_own_auction(test_auction: int, authorized_auction_seller_client: TestClient):
    """
    Test that a seller cannot bid on their own auction.
    """
    bid_data = {"bid_amount": 15.00, "max_bid": 20.00}
    response = authorized_auction_seller_client.post(f"/api/v1/auctions/{test_auction}/bid", json=bid_data)
    assert response.status_code == 400
    assert "You cannot bid on your own auction." in response.json()["detail"]

def test_finalize_auction_success(test_product_for_auction: Product, db_session: Session, test_users_for_auctions, unauthenticated_client: TestClient):
    """
    Test finalizing an auction successfully (assuming time has passed and a bid was placed).
    This test requires modifying the auction's end_time for successful finalization.
    """
    seller, bidder, _ = test_users_for_auctions
    
    # Create a new auction that can be finalized immediately (as seller)
    app.dependency_overrides[get_current_user] = lambda: seller
    auction_data = {
        "product_id": test_product_for_auction.product_id,
        "starting_bid": 10.00,
        "reserve_limit": 10.00, # Met by starting bid
        "end_time": (datetime.now(UTC) + timedelta(minutes=5)).isoformat() # In the past
    }
    response = unauthenticated_client.post("/api/v1/auctions/", json=auction_data)
    assert response.status_code == 201
    auction_id = response.json()["auction_id"]

    # Place a winning bid (as bidder)
    app.dependency_overrides[get_current_user] = lambda: bidder
    bid_data = {"bid_amount": 15.00, "max_bid": 20.00}
    bid_response = unauthenticated_client.post(f"/api/v1/auctions/{auction_id}/bid", json=bid_data)
    assert bid_response.status_code == 200

    # FAST-FORWARD TIME: Manually set the DB end_time to the PAST
    db_auction = db_session.query(Auction).filter(Auction.auction_id == auction_id).first()
    db_auction.end_time = datetime.now(UTC) - timedelta(minutes=5)
    db_session.commit()
    
    # Finalize as seller
    app.dependency_overrides[get_current_user] = lambda: seller
    response = unauthenticated_client.post(f"/api/v1/auctions/{auction_id}/finalize")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    finalized_auction = response.json()
    assert finalized_auction["status"] == "successful"
    assert finalized_auction["winning_buyer_id"] == bidder.user_id
    assert finalized_auction["current_highest_bid"] > 0
    
    # Cleanup for fixture
    crud_auction.cancel_auction(db_session, auction_id)


def test_finalize_auction_too_early(test_auction: int, authorized_auction_seller_client: TestClient):
    """
    Test finalizing an auction that is still active.
    """
    response = authorized_auction_seller_client.post(f"/api/v1/auctions/{test_auction}/finalize")
    assert response.status_code == 400
    assert "Auction is still active" in response.json()["detail"]

def test_finalize_auction_no_bids_reserve_not_met(test_product_for_auction: Product, authorized_auction_seller_client: TestClient):
    """
    Test finalizing an auction with no bids and reserve not met.
    """
    # Create an auction with reserve and no bids
    auction_data = {
        "product_id": test_product_for_auction.product_id,
        "starting_bid": 10.00,
        "reserve_limit": 1000.00, # Very high reserve
        "end_time": (datetime.now(UTC) - timedelta(minutes=5)).isoformat() # In the past
    }
    response = authorized_auction_seller_client.post("/api/v1/auctions/", json=auction_data)
    assert response.status_code == 201
    auction_id = response.json()["auction_id"]

    # Finalize it
    response = authorized_auction_seller_client.post(f"/api/v1/auctions/{auction_id}/finalize")
    assert response.status_code == 200 # Finalize returns 200 even for unsuccessful, but status is updated
    finalized_auction = response.json()
    assert finalized_auction["status"] == "unsuccessful"
    assert finalized_auction["reserve_limit"] == 1000.00 # Check the reserve was there
