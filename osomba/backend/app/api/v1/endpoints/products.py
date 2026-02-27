"""
File: api/v1/endpoints/products.py
Purpose: API endpoints for managing products (Create, Read, Update).
Usage: Clients use this to fetch the catalog or sellers to list items.
Architecture: Endpoint Layer - Handles HTTP requests for Products.
"""
from typing import List
from fastapi import APIRouter, status
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.api.dependencies import ProductServiceDep, CurrentUserDep

router = APIRouter()

@router.get("/", response_model=List[Product])
def read_products(
    service: ProductServiceDep,
    skip: int = 0,
    limit: int = 100,
):
    """
    List products with pagination.
    """
    return service.get_products(skip=skip, limit=limit)

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_new_product(
    product: ProductCreate,
    service: ProductServiceDep,
    current_user: CurrentUserDep
):
    """
    Create a new product listing.
    """
    return service.create_product(product_in=product, current_user=current_user)

@router.get("/{product_id}", response_model=Product)
def read_product(
    product_id: int,
    service: ProductServiceDep
):
    """
    Get details of a specific product.
    """
    return service.get_product(product_id)

@router.put("/{product_id}", response_model=Product)
def update_product_endpoint(
    product_id: int,
    product_in: ProductUpdate,
    service: ProductServiceDep,
    current_user: CurrentUserDep,
):
    """
    Update a product listing.
    """
    return service.update_product(product_id, product_in, current_user)

@router.delete("/{product_id}", response_model=Product)
def delete_product_endpoint(
    product_id: int,
    service: ProductServiceDep,
    current_user: CurrentUserDep,
):
    """
    Delete a product listing.
    """
    return service.delete_product(product_id, current_user)
