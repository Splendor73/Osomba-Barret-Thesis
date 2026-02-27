"""
File: api/v1/endpoints/auctions.py
Purpose: API endpoints for auctions and placing bids.
Architecture: Endpoint Layer - Handles HTTP requests for Auctions mapping to AuctionService.
"""
from typing import List
from fastapi import APIRouter, status

from app.schemas.auction import Auction, AuctionCreate, AuctionUpdate, Bid, BidCreate
from app.api.dependencies import AuctionServiceDep, CurrentUserDep

router = APIRouter()

@router.get("/", response_model=List[Auction])
def read_auctions(
    service: AuctionServiceDep,
    skip: int = 0,
    limit: int = 100
):
    """
    List active auctions.
    """
    return service.get_auctions(skip=skip, limit=limit)

@router.post("/", response_model=Auction, status_code=status.HTTP_201_CREATED)
def create_new_auction(
    auction: AuctionCreate,
    service: AuctionServiceDep,
    current_user: CurrentUserDep
):
    """
    Create a new auction listing.
    """
    return service.create_auction(auction_in=auction, current_user=current_user)

@router.get("/{auction_id}", response_model=Auction)
def read_auction(
    auction_id: int,
    service: AuctionServiceDep
):
    """
    Get detailed information about a specific auction.
    """
    return service.get_auction(auction_id)

@router.put("/{auction_id}", response_model=Auction)
def update_auction_endpoint(
    auction_id: int,
    auction_in: AuctionUpdate,
    service: AuctionServiceDep,
    current_user: CurrentUserDep,
):
    """
    Update auction details.
    """
    return service.update_auction(auction_id, auction_in, current_user)

@router.post("/{auction_id}/cancel", response_model=Auction)
def cancel_auction_endpoint(
    auction_id: int,
    service: AuctionServiceDep,
    current_user: CurrentUserDep,
):
    """
    Cancel an active auction.
    """
    return service.cancel_auction(auction_id, current_user)

@router.post("/{auction_id}/finalize", response_model=Auction)
def finalize_auction_endpoint(
    auction_id: int,
    service: AuctionServiceDep
):
    """
    Finalize an auction manually.
    """
    return service.finalize_auction(auction_id)

@router.post("/{auction_id}/bid", response_model=Bid)
def place_auction_bid(
    auction_id: int,
    bid: BidCreate,
    service: AuctionServiceDep,
    current_user: CurrentUserDep
):
    """
    Place a bid on an auction.
    Handles proxy bidding, anti-sniping extensions, and validation.
    """
    # Prevent bidding on own auction
    auction = service.get_auction(auction_id)
    if auction.seller_id == current_user.user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="You cannot bid on your own auction.")
        
    return service.place_bid(
        auction_id=auction_id,
        bid_in=bid,
        current_user=current_user
    )
