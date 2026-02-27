from typing import Optional, List
from pydantic import BaseModel, ConfigDict, HttpUrl
from datetime import datetime

# Shared properties
class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    images: Optional[str] = None # Keeping simple as comma-separated string for now, or JSON string
    quantity: int = 1
    price: float
    end_time: Optional[datetime] = None
    product_listing_type: str = "Buy it now"

# Properties to receive on item creation
class ProductCreate(ProductBase):
    pass

# Properties to receive on item update
class ProductUpdate(ProductBase):
    title: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    product_listing_type: Optional[str] = None

# Properties shared by models stored in DB
class ProductInDBBase(ProductBase):
    product_id: int
    seller_id: int

    model_config = ConfigDict(from_attributes=True)

# Properties to return to client
class Product(ProductInDBBase):
    pass

# Properties stored in DB
class ProductInDB(ProductInDBBase):
    pass
