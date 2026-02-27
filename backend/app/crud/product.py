"""
File: crud/product.py
Purpose: Database operations for Products.
Usage: Called by product endpoints to query/update DB.
Architecture: CRUD Layer - Data Access for Products.
"""
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.product_id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()

def get_products_by_seller(db: Session, seller_id: int, only_available: bool = False):
    query = db.query(Product).filter(Product.seller_id == seller_id)
    if only_available:
        query = query.filter(Product.quantity > 0)
    return query.all()

def create_product(db: Session, product: ProductCreate, seller_id: int):
    db_product = Product(
        **product.model_dump(),
        seller_id=seller_id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product
