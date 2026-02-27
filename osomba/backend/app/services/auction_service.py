"""
File: services/auction_service.py
Purpose: Domain logic for Auctions (Bidding, Anti-Sniping, Proxy Bidding).
Architecture: Service Layer - Handles complex bidding rules.
"""
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.crud import auction as auction_repo
from app.models.user import User
from app.models.auction import Auction
from app.schemas.auction import AuctionCreate, BidCreate
from datetime import timezone

class AuctionService:
    def __init__(self, db: Session):
        self.db = db

    def _calculate_min_increment(self, current_price: float) -> float:
        """Determines the minimum bid increment based on current price."""
        if current_price < 1.0: return 0.05
        if current_price < 10.0: return 0.50
        if current_price < 100.0: return 1.00
        if current_price < 1000.0: return 10.00
        return 50.00

    def get_auctions(self, skip: int = 0, limit: int = 100):
        return auction_repo.get_auctions(self.db, skip, limit)

    def get_auction(self, auction_id: int):
        auction = auction_repo.get_auction(self.db, auction_id)
        if not auction:
            raise HTTPException(status_code=404, detail="Auction not found")
        return auction

    def create_auction(self, auction_in: AuctionCreate, current_user: User):
        # Business Rule: User verification if needed
        return auction_repo.create_auction(self.db, auction_in, current_user.user_id)

    def place_bid(self, auction_id: int, bid_in: BidCreate, current_user: User):
        """
        Processes a bid with Proxy Bidding and Anti-Sniping logic.
        """
        # 1. Lock Auction Row
        auction = auction_repo.get_auction_for_update(self.db, auction_id)
        if not auction:
            raise HTTPException(status_code=404, detail="Auction not found")
        
        if auction.status != 'active':
            raise HTTPException(status_code=400, detail="Auction is not active")
            
        # Ensure we are comparing offset-aware datetimes
        now = datetime.now(timezone.utc)
        
        aware_end_time = auction.end_time
        if aware_end_time.tzinfo is None:
            # Make it offset-aware (assuming UTC from DB)
            aware_end_time = aware_end_time.replace(tzinfo=timezone.utc)

        if now > aware_end_time:
            # Auto-expire logic could go here, but for now just reject
            raise HTTPException(status_code=400, detail="Auction has ended")

        # 2. Anti-Sniping Extension
        time_remaining = aware_end_time - now
        if time_remaining < timedelta(minutes=10):
            auction.end_time += timedelta(minutes=1) # Extend if bid in last 10 mins

        current_high = float(auction.current_highest_bid or 0.0)
        starting = float(auction.starting_bid)
        
        # 3. Calculate Minimum Required Bid
        if current_high == 0.0:
            min_req = starting
        else:
            min_req = current_high + self._calculate_min_increment(current_high)

        if bid_in.max_bid < min_req:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bid must be at least ${min_req:.2f}"
            )

        # 4. Proxy Bidding Logic
        last_winning_bid = auction_repo.get_highest_bid(self.db, auction_id)
        
        new_current_price = current_high
        new_winner_id = None
        bid_result = None

        if not last_winning_bid:
            # First bid ever
            new_current_price = starting
            new_winner_id = current_user.user_id
            
            bid_result = auction_repo.create_bid(
                self.db, auction_id, current_user.user_id, 
                amount=new_current_price, max_bid=bid_in.max_bid, time_placed=now
            )
        else:
            prev_max = float(last_winning_bid.max_bid)
            prev_bidder = last_winning_bid.bidder_id
            
            if current_user.user_id == prev_bidder:
                # User updating their own max bid
                if bid_in.max_bid <= prev_max:
                    raise HTTPException(status_code=400, detail="New max bid must be higher than your current max")
                
                # Just update the max bid, price stays same
                last_winning_bid = auction_repo.update_bid(
                    self.db, last_winning_bid.bid_id, bid_in.max_bid, now
                )
                self.db.commit()
                return last_winning_bid # Return updated bid

            # Competition: New Bidder vs Old Bidder
            if bid_in.max_bid > prev_max:
                # New bidder wins
                # Price is pushed to: Old Max + Increment (capped at New Max)
                price_calc = prev_max + self._calculate_min_increment(prev_max)
                new_current_price = min(price_calc, bid_in.max_bid)
                new_winner_id = current_user.user_id
                
                bid_result = auction_repo.create_bid(
                    self.db, auction_id, current_user.user_id,
                    amount=new_current_price, max_bid=bid_in.max_bid, time_placed=now
                )
            elif bid_in.max_bid < prev_max:
                # Old bidder stays winner (Auto-Defense)
                # Price is pushed to: New Max + Increment (capped at Old Max)
                price_calc = bid_in.max_bid + self._calculate_min_increment(bid_in.max_bid)
                new_current_price = min(price_calc, prev_max)
                new_winner_id = prev_bidder
                
                # Create a losing bid record for the challenger
                # Wait, usually we record every bid. Yes.
                bid_result = auction_repo.create_bid(
                    self.db, auction_id, current_user.user_id,
                    amount=bid_in.max_bid, max_bid=bid_in.max_bid, time_placed=now
                )
            else:
                # Tie on max bid -> Earliest one wins (Old bidder)
                new_current_price = prev_max
                new_winner_id = prev_bidder
                
                bid_result = auction_repo.create_bid(
                    self.db, auction_id, current_user.user_id,
                    amount=bid_in.max_bid, max_bid=bid_in.max_bid, time_placed=now
                )

        # 5. Update Auction State
        auction.current_highest_bid = new_current_price
        auction.winning_buyer_id = new_winner_id
        
        self.db.add(auction)
        self.db.commit()
        self.db.refresh(bid_result)
        
        return bid_result

    def update_auction(self, auction_id: int, auction_update: dict, current_user: User):
        auction = self.get_auction(auction_id)
        
        # Authorization: only seller or admin can update
        if auction.seller_id != current_user.user_id and getattr(current_user, 'role', '') != 'admin':
            raise HTTPException(status_code=403, detail="Not enough permissions")

        result = auction_repo.update_auction(self.db, auction_id, auction_update)
        if not result:
            raise HTTPException(status_code=404, detail="Auction not found")
        return result

    def cancel_auction(self, auction_id: int, current_user: User):
        auction = self.get_auction(auction_id)
        
        # Authorization: only seller or admin can cancel
        if auction.seller_id != current_user.user_id and getattr(current_user, 'role', '') != 'admin':
            raise HTTPException(status_code=403, detail="Not enough permissions")

        result = auction_repo.cancel_auction(self.db, auction_id)
        if not result:
            raise HTTPException(status_code=404, detail="Auction not found")
        return result

    def finalize_auction(self, auction_id: int):
        # We assume authorization is handled before calling this (e.g., cron job or admin endpoint)
        try:
            result_msg = auction_repo.finalize_auction(self.db, auction_id)
            final_auction = self.get_auction(auction_id)
            return final_auction
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
