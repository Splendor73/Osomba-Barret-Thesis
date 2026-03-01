"""
File: services/order_service.py
Purpose: Domain logic for Orders (Checkout, Inventory Management).
Architecture: Service Layer - Handles business rules and multi-repository orchestration.
"""
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.crud import order as order_repo
from app.crud import product as product_repo
from app.models.user import User
from app.schemas.order import OrderCreate

class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def checkout(self, order_in: OrderCreate, current_user: User):
        """
        Processes a new order:
        1. Validates product existence and stock.
        2. Calculates total cost.
        3. Deducts inventory.
        4. Creates Order and OrderItems transactionally.
        """
        total_cost = 0.0
        items_to_persist = []
        
        # Start Transaction (implicitly via session, but we will commit at the end)
        try:
            for item in order_in.items:
                product = product_repo.get_product(self.db, item.product_id)
                if not product:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Product {item.product_id} not found"
                    )
                
                if product.quantity < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Not enough quantity for {product.title}. Available: {product.quantity}, Requested: {item.quantity}"
                    )
                
                # Business Logic: Calculate line item cost
                item_total = float(product.price) * item.quantity
                total_cost += item_total
                
                # Business Logic: Deduct inventory
                product.quantity -= item.quantity
                self.db.add(product) # Queue update
                
                items_to_persist.append({
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "price_of_item": float(product.price)
                })
            
            # Create Order Record
            db_order = order_repo.create_order_record(
                self.db,
                buyer_id=current_user.user_id,
                shipping_type=order_in.shipping_type,
                shipping_address=order_in.shipping_address,
                total_cost=total_cost
            )
            
            # Create Items
            for item_data in items_to_persist:
                order_repo.create_order_item(
                    self.db,
                    order_id=db_order.order_id,
                    **item_data
                )
            
            self.db.commit()
            self.db.refresh(db_order)
            return db_order
            
        except Exception as e:
            # Let FastAPI's dependency injection / exception handlers manage the rollback
            # if it's an HTTPException, just bubble it up.
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Checkout failed: {str(e)}"
            )

    def get_my_orders(self, current_user: User, skip: int = 0, limit: int = 100):
        return order_repo.get_orders_by_buyer(self.db, current_user.user_id, skip, limit)

    def get_order_details(self, order_id: int, current_user: User):
        order = order_repo.get_order(self.db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Security: Only buyer or admin can view
        if order.buyer_id != current_user.user_id and getattr(current_user, 'role', '') != 'admin':
             raise HTTPException(status_code=403, detail="Not authorized to view this order")
             
        return order

    def get_all_orders(self, current_user: User, skip: int = 0, limit: int = 100):
        if getattr(current_user, 'role', '') != 'admin':
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return order_repo.get_all_orders(self.db, skip, limit)

    def update_order(self, order_id: int, order_update: dict, current_user: User):
        if getattr(current_user, 'role', '') != 'admin':
            raise HTTPException(status_code=403, detail="Not enough permissions")
        
        db_order = order_repo.update_order(self.db, order_id, order_update)
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")
        return db_order

    def delete_order(self, order_id: int, current_user: User):
        if getattr(current_user, 'role', '') != 'admin':
            raise HTTPException(status_code=403, detail="Not enough permissions")
            
        db_order = order_repo.delete_order(self.db, order_id)
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")
        return db_order
