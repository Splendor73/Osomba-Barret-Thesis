from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = None

class OrderItem(OrderItemBase):
    order_item_id: int
    price_of_item: float

    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    shipping_type: str
    shipping_address: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    shipping_type: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_status: Optional[str] = None

class OrderInDBBase(OrderBase):
    order_id: int
    buyer_id: int
    total_cost: float
    shipping_status: str
    payment_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

class Order(OrderInDBBase):
    items: List[OrderItem]
