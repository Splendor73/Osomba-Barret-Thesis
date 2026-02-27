"""
File: api/v1/endpoints/orders.py
Purpose: API endpoints for checkout and order history.
Architecture: Endpoint Layer - Handles HTTP requests for Orders mapping to OrderService.
"""
from typing import List
from fastapi import APIRouter, status

from app.schemas.order import Order, OrderCreate, OrderUpdate
from app.api.dependencies import OrderServiceDep, CurrentUserDep

router = APIRouter()

@router.post("/checkout", response_model=Order, status_code=status.HTTP_201_CREATED)
def checkout(
    order: OrderCreate,
    service: OrderServiceDep,
    current_user: CurrentUserDep
):
    """
    Process a checkout request.
    Validates stock, calculates totals, and creates the order.
    """
    return service.checkout(order_in=order, current_user=current_user)

@router.get("/my-orders", response_model=List[Order])
def read_user_orders(
    service: OrderServiceDep,
    current_user: CurrentUserDep,
    skip: int = 0,
    limit: int = 100
):
    """
    List orders for the current user.
    """
    return service.get_my_orders(current_user, skip=skip, limit=limit)

@router.get("/", response_model=List[Order])
def read_all_orders(
    service: OrderServiceDep,
    current_user: CurrentUserDep,
    skip: int = 0,
    limit: int = 100
):
    """
    Get all orders (Admin only).
    """
    return service.get_all_orders(current_user, skip=skip, limit=limit)

@router.get("/{order_id}", response_model=Order)
def read_order_details(
    order_id: int,
    service: OrderServiceDep,
    current_user: CurrentUserDep
):
    """
    Get detailed information about a specific order.
    """
    return service.get_order_details(order_id, current_user)

@router.put("/{order_id}", response_model=Order)
def update_order_endpoint(
    order_id: int,
    order_in: OrderUpdate,
    service: OrderServiceDep,
    current_user: CurrentUserDep,
):
    """
    Update an order (e.g., shipping status). Admin only.
    """
    return service.update_order(order_id, order_in, current_user)

@router.delete("/{order_id}", response_model=Order)
def delete_order_endpoint(
    order_id: int,
    service: OrderServiceDep,
    current_user: CurrentUserDep,
):
    """
    Delete an order. Admin only.
    """
    return service.delete_order(order_id, current_user)
