from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Product(Base):
    __tablename__ = "product"

    product_id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    images = Column(String)  # Storing as JSON string or comma-separated URLs
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric, nullable=False)
    end_time = Column(DateTime(timezone=True))
    product_listing_type = Column(String, nullable=False)  # 'Buy it now', 'Auction', 'Both'

    seller = relationship("User", backref="products")
