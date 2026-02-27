"""
File: crud/auction.py
Purpose: Pure database operations for Auctions (Repository).
Usage: Called by AuctionService to persist auctions and bids.
Architecture: CRUD Layer - Data Access ONLY.
"""
from datetime import datetime, timedelta, UTC

from sqlalchemy.orm import Session
from app.models.auction import Auction, Bid
from app.schemas.auction import AuctionCreate, AuctionUpdate, BidCreate

def get_auction(db: Session, auction_id: int):
    return db.query(Auction).filter(Auction.auction_id == auction_id).first()

def get_auction_for_update(db: Session, auction_id: int):
    """Locks the auction row for transactional updates."""
    return db.query(Auction).filter(Auction.auction_id == auction_id).with_for_update().first()

def get_auctions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Auction).offset(skip).limit(limit).all()

def create_auction(db: Session, auction: AuctionCreate, seller_id: int):
    db_auction = Auction(
        product_id=auction.product_id,
        seller_id=seller_id,
        current_highest_bid=0,
        starting_bid=auction.starting_bid,
        reserve_limit=auction.reserve_limit,
        end_time=auction.end_time,

        status='active'
    )
    db.add(db_auction)
    db.commit()
    db.refresh(db_auction)
    return db_auction

def get_highest_bid(db: Session, auction_id: int):
    return db.query(Bid).filter(
        Bid.auction_id == auction_id
    ).order_by(Bid.max_bid.desc(), Bid.time_placed.asc()).first()

def update_auction(db: Session, auction_id: int, auction_update: AuctionUpdate):
    db_auction = get_auction(db, auction_id)
    if not db_auction:
        return None
    
    update_data = auction_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_auction, key, value)

    db.commit()
    db.refresh(db_auction)
    return db_auction

def cancel_auction(db: Session, auction_id: int):
    db_auction = get_auction(db, auction_id)
    if not db_auction:
        return None
    
    db_auction.status = 'cancelled'
    db.commit()
    db.refresh(db_auction)
    return db_auction

def create_bid(db: Session, auction_id: int, bidder_id: int, amount: float, max_bid: float, time_placed):
    db_bid = Bid(
        auction_id=auction_id,
        bidder_id=bidder_id,
        bid_amount=amount,
        max_bid=max_bid,
        time_placed=time_placed
    )
    db.add(db_bid)
    db.flush() # Flush to get ID, commit handled by service
    return db_bid

def update_bid(db: Session, bid_id: int, max_bid: float, time_placed):
    bid = db.query(Bid).filter(Bid.bid_id == bid_id).first()
    if bid:
        bid.max_bid = max_bid
        bid.time_placed = time_placed
        db.flush()
    return bid

def finalize_auction(db: Session, auction_id: int):
    """
    Closes an auction, checks reserve price, and determines final status.
    Equivalent to Justin's 'finalizeAuction'.
    """
    auction = db.query(Auction).filter(Auction.auction_id == auction_id).with_for_update().first()
    if not auction:
        return "Auction not found"
        
    if auction.status in ['successful', 'unsuccessful', 'cancelled']:
        return "Auction already finalized"
        
    now = datetime.now(UTC)

    # --- 1. SAFELY HANDLE TIMEZONE ---
    aware_end_time = auction.end_time
    if aware_end_time.tzinfo is None:
        aware_end_time = aware_end_time.replace(tzinfo=UTC)
        
    # --- 2. UPDATE COMPARISON ---
    # If using lazy checking, verify time. 
    # For manual finalization, we might allow it if close enough or admin forced.
    if now < aware_end_time:
        raise ValueError("Auction is still active")
         
    # Check bids
    if not auction.winning_buyer_id or not auction.current_highest_bid:
        auction.status = 'unsuccessful'
        db.commit()
        return "Auction ended without bids"
        
    # Check Reserve
    current_price = float(auction.current_highest_bid)
    if auction.reserve_limit and current_price < float(auction.reserve_limit):
        auction.status = 'unsuccessful'
        auction.winning_buyer_id = None # No winner if reserve not met
        db.commit()
        return "Reserve not met"
        
    # Success
    auction.status = 'successful'
    db.commit()
    return f"Auction successful! Winner: {auction.winning_buyer_id} at ${current_price}"
