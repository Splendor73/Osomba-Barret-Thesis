"""
File: services/product_service.py
Purpose: Domain logic for Products.
Architecture: Service Layer - Handles business rules and orchestration.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud import product as product_repo
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate
from app.core.exceptions import NotFoundException, PermissionDeniedException

class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_product(self, product_id: int):
        product = product_repo.get_product(self.db, product_id)
        if not product:
            raise NotFoundException(f"Product with id {product_id} not found")
        return product

    def get_products(self, skip: int = 0, limit: int = 100):
        return product_repo.get_products(self.db, skip=skip, limit=limit)

    def create_product(self, product_in: ProductCreate, current_user: User):
        # Business Rule: Check if user is allowed to sell
        if hasattr(current_user, 'is_suspended') and current_user.is_suspended:
             raise PermissionDeniedException("Suspended users cannot create products")
            
        return product_repo.create_product(self.db, product_in, current_user.user_id)

    def update_product(self, product_id: int, product_update: ProductUpdate, current_user: User):
        product = self.get_product(product_id)
        
        # Business Rule: Only the owner (seller) or an admin can update the product
        if product.seller_id != current_user.user_id and getattr(current_user, 'role', '') != 'admin':
            raise PermissionDeniedException("Not authorized to update this product")
            
        return product_repo.update_product(self.db, product_id, product_update)

    def delete_product(self, product_id: int, current_user: User):
        product = self.get_product(product_id)
        
        # Business Rule: Only the owner (seller) or an admin can delete the product
        if product.seller_id != current_user.user_id and getattr(current_user, 'role', '') != 'admin':
            raise PermissionDeniedException("Not authorized to delete this product")
            
        return product_repo.delete_product(self.db, product_id)

    def list_my_products(self, current_user: User):
        return product_repo.get_products_by_seller(self.db, current_user.user_id)
