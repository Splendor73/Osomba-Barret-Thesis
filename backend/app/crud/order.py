"""
File: crud/order.py
Purpose: Pure database operations for Orders (Repository).
Usage: Called by OrderService to persist orders and items.
Architecture: CRUD Layer - Data Access ONLY.
"""
from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.schemas.order import OrderUpdate, OrderItemUpdate


def create_order_record(db: Session, buyer_id: int, shipping_type: str, shipping_address: str, total_cost: float):
    """Creates the main Order record."""
    db_order = Order(
        buyer_id=buyer_id,
        total_cost=total_cost,
        shipping_type=shipping_type,
        shipping_address=shipping_address,
        shipping_status='Pending'
    )
    db.add(db_order)
    db.flush() # Flush to get the ID, but don't commit yet (transaction managed by Service)
    return db_order

def create_order_item(db: Session, order_id: int, product_id: int, quantity: int, price_of_item: float):
    """Creates a single OrderItem record."""
    db_item = OrderItem(
        order_id=order_id,
        product_id=product_id,
        quantity=quantity,
        price_of_item=price_of_item
    )
    db.add(db_item)
    return db_item

def get_orders_by_buyer(db: Session, buyer_id: int, skip: int = 0, limit: int = 100):
    return db.query(Order).filter(Order.buyer_id == buyer_id).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: int):
    return db.query(Order).filter(Order.order_id == order_id).first()

def get_order_by_id(db: Session, order_id: int): # Alias for team compatibility
    return get_order(db, order_id)

def get_all_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Order).offset(skip).limit(limit).all()

def update_order_status(db: Session, order_id: int, status: str):
    order = get_order(db, order_id)
    if order:
        order.shipping_status = status
        db.add(order)

def update_order(db: Session, order_id: int, order_update: OrderUpdate):
    db_order = get_order_by_id(db, order_id)
    if not db_order:
        return None
    update_data = order_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)
    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int):
    db_order = get_order_by_id(db, order_id)
    if db_order:
        db.delete(db_order)
        db.commit()
    return db_order
# -------------------- ORDER ITEMS --------------------

def get_order_item_by_id(db: Session, order_item_id: int):
    return db.query(OrderItem).filter(OrderItem.order_item_id == order_item_id).first()

def get_order_items_by_order_id(db: Session, order_id: int):
    return db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

def update_order_item(db: Session, order_item_id: int, order_item_update: OrderItemUpdate):
    # Note: Updating an order item's quantity should likely trigger order total recalculation.
    # This is a simple update for now.
    db_item = get_order_item_by_id(db, order_item_id)
    if not db_item:
        return None
    update_data = order_item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_order_item(db: Session, order_item_id: int):
    # Note: Deleting an order item should likely trigger order total recalculation.
    db_item = get_order_item_by_id(db, order_item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item
