from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from app.db.database import Base


class Auction(Base):
    __tablename__ = "auction"

    auction_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.product_id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    winning_buyer_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    starting_bid = Column(Numeric, nullable=False)
    current_highest_bid = Column(Numeric)
    reserve_limit = Column(Numeric)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default='active')  # 'active','successful','unsuccessful','cancelled'

    product = relationship("Product", backref="auctions")
    seller = relationship("User", foreign_keys=[seller_id], backref="auctions_selling")
    winning_buyer = relationship("User", foreign_keys=[winning_buyer_id], backref="auctions_won")


class Bid(Base):
    __tablename__ = "bids"

    bid_id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auction.auction_id"), nullable=False)
    bidder_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    bid_amount = Column(Numeric, nullable=False)
    max_bid = Column(Numeric, nullable=False)
    time_placed = Column(DateTime(timezone=True), nullable=False)

    auction = relationship("Auction", backref="bids")
    bidder = relationship("User", backref="bids")
