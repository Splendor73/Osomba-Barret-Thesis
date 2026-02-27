from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# --- BID SCHEMAS ---
class BidBase(BaseModel):
    bid_amount: float
    max_bid: float

class BidCreate(BidBase):
    pass

class BidInDBBase(BidBase):
    bid_id: int
    auction_id: int
    bidder_id: int
    time_placed: datetime

    model_config = ConfigDict(from_attributes=True)

class Bid(BidInDBBase):
    pass

# --- AUCTION SCHEMAS ---
class AuctionBase(BaseModel):
    starting_bid: float
    reserve_limit: Optional[float] = None
    end_time: datetime

class AuctionCreate(AuctionBase):
    product_id: int

class AuctionUpdate(BaseModel):
    starting_bid: Optional[float] = None
    reserve_limit: Optional[float] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    current_highest_bid: Optional[float] = None

class AuctionInDBBase(AuctionBase):
    auction_id: int
    seller_id: int
    product_id: int
    current_highest_bid: Optional[float] = None
    winning_buyer_id: Optional[int] = None
    status: str

    model_config = ConfigDict(from_attributes=True)

class Auction(AuctionInDBBase):
    bids: List[Bid] = []
