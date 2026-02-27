# Backend Architecture Pipeline: Models, Schemas, CRUD & Endpoints

This document explains how our FastAPI backend is organized and how data flows through the different layers when processing an API request.

---

## Table of Contents
1. [Overview: The 4-Layer Architecture](#overview-the-4-layer-architecture)
2. [Layer 1: Endpoints (API Routes)](#layer-1-endpoints-api-routes)
3. [Layer 2: Schemas (Data Validation)](#layer-2-schemas-data-validation)
4. [Layer 3: CRUD (Business Logic)](#layer-3-crud-business-logic)
5. [Layer 4: Models (Database Tables)](#layer-4-models-database-tables)
6. [Complete Request Flow Example](#complete-request-flow-example)
7. [Why Separate These Layers?](#why-separate-these-layers)
8. [Quick Reference: Layer Comparison](#quick-reference-layer-comparison)

---

## Overview: The 4-Layer Architecture

Our backend follows a **layered architecture** pattern where each layer has a specific responsibility:

```
┌─────────────────────────────────────────────────────┐
│              CLIENT (Mobile App)                    │
│         Sends JSON, Receives JSON                   │
└─────────────────────────────────────────────────────┘
                         ↕ HTTP
┌─────────────────────────────────────────────────────┐
│ [1] ENDPOINTS (api/v1/endpoints/)                   │
│     📍 Purpose: Handle HTTP requests/responses      │
│     📁 Files: orders.py, products.py, auth.py       │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│ [2] SCHEMAS (app/schemas/)                          │
│     ✅ Purpose: Validate & serialize data           │
│     📁 Files: order.py, product.py, user.py         │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│ [3] CRUD (app/crud/)                                │
│     ⚙️ Purpose: Business logic & DB operations      │
│     📁 Files: order.py, product.py, user.py         │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│ [4] MODELS (app/models/)                            │
│     🗄️ Purpose: Database table definitions         │
│     📁 Files: order.py, product.py, user.py         │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL)                  │
└─────────────────────────────────────────────────────┘
```

---

## Layer 1: Endpoints (API Routes)

**Location:** `backend/app/api/v1/endpoints/`

### Purpose
Define HTTP routes that clients can access. Handle authentication, call CRUD functions, and return HTTP responses.

### What Endpoints Know About
- ✅ HTTP methods (GET, POST, PUT, DELETE)
- ✅ URL routes (`/checkout`, `/products`)
- ✅ Status codes (200, 201, 400, 404)
- ✅ Authentication & authorization
- ✅ Request/response formatting

### What Endpoints DON'T Know About
- ❌ Database queries
- ❌ Business logic (calculations, validations)
- ❌ How data is stored

### Real Example: Order Checkout Endpoint

**File:** `backend/app/api/v1/endpoints/orders.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.api.dependencies import get_current_user
from app.schemas.order import Order, OrderCreate
from app.crud.order import create_order, get_orders

router = APIRouter()

@router.post("/checkout", response_model=Order, status_code=status.HTTP_201_CREATED)
def checkout(
    order: OrderCreate,                          # ← Pydantic schema validates input
    db: Session = Depends(get_db),              # ← Database connection
    current_user: User = Depends(get_current_user)  # ← Authentication
):
    """
    Create a new order for the current user.
    
    Endpoint's responsibilities:
    1. Verify user is authenticated (get_current_user)
    2. Validate incoming data (OrderCreate schema)
    3. Call CRUD function to process the order
    4. Return response (FastAPI converts to JSON automatically)
    """
    try:
        return create_order(db=db, order=order, buyer_id=current_user.user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[Order])
def read_my_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all orders for the current user.
    """
    return get_orders(db=db, user_id=current_user.user_id, skip=skip, limit=limit)
```

**Key Points:**
- Endpoint defines the HTTP method (`@router.post`, `@router.get`)
- `response_model=Order` tells FastAPI to convert output to JSON using the Order schema
- Delegates actual work to CRUD functions (`create_order`, `get_orders`)

---

## Layer 2: Schemas (Data Validation)

**Location:** `backend/app/schemas/`

### Purpose
Define the structure of data coming INTO the API (from clients) and going OUT of the API (to clients). Uses **Pydantic** for automatic validation.

### What Schemas Know About
- ✅ Data types (str, int, float, List, Optional)
- ✅ Required vs optional fields
- ✅ Validation rules (min/max values, string patterns)
- ✅ JSON serialization

### What Schemas DON'T Know About
- ❌ Database structure
- ❌ HTTP routes
- ❌ Business logic

### Real Example: Order Schemas

**File:** `backend/app/schemas/order.py`

```python
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# --- For Order Items ---

class OrderItemBase(BaseModel):
    """Base schema for order items"""
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    """Schema for creating an order item (what client sends)"""
    pass

class OrderItem(OrderItemBase):
    """Schema for returning order item data (what API sends back)"""
    order_item_id: int
    price_of_item: float

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models


# --- For Orders ---

class OrderBase(BaseModel):
    """Base schema with common order fields"""
    shipping_type: str
    shipping_address: Optional[str] = None

class OrderCreate(OrderBase):
    """Schema for creating an order (what client sends in POST /checkout)"""
    items: List[OrderItemCreate]  # ← Validates that items is a list of OrderItemCreate

class OrderInDBBase(OrderBase):
    """Schema for order data from database"""
    order_id: int
    buyer_id: int
    total_cost: float
    shipping_status: str
    payment_id: Optional[int] = None

    class Config:
        from_attributes = True  # ← Crucial: allows FastAPI to convert SQLAlchemy → Pydantic

class Order(OrderInDBBase):
    """Schema for complete order response (what API sends back)"""
    items: List[OrderItem]  # ← Includes all order items
```

**The Flow:**
1. **Client sends JSON** → Pydantic validates it against `OrderCreate`
2. **CRUD returns SQLAlchemy object** → FastAPI converts it to `Order` schema
3. **Order schema serialized** → JSON sent to client

**Example Client Request:**
```json
POST /api/v1/checkout
{
  "shipping_type": "Shipping",
  "shipping_address": "123 Main St",
  "items": [
    {"product_id": 5, "quantity": 2},
    {"product_id": 8, "quantity": 1}
  ]
}
```

Pydantic automatically validates:
- `shipping_type` is a string ✅
- `items` is a list ✅
- Each item has `product_id` (int) and `quantity` (int) ✅

If validation fails, FastAPI returns a 422 error automatically.

---

## Layer 3: CRUD (Business Logic)

**Location:** `backend/app/crud/`

### Purpose
Reusable functions that contain business logic and database operations. CRUD stands for **Create, Read, Update, Delete**.

### What CRUD Knows About
- ✅ Database queries (SELECT, INSERT, UPDATE, DELETE)
- ✅ SQLAlchemy models
- ✅ Business rules (stock validation, price calculation)
- ✅ Transaction management (commit, rollback)

### What CRUD DON'T Know About
- ❌ HTTP routes or status codes
- ❌ JSON structure
- ❌ Authentication tokens

### Real Example: Order CRUD

**File:** `backend/app/crud/order.py`

```python
from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate

def create_order(db: Session, order: OrderCreate, buyer_id: int):
    """
    Create a new order with order items.
    
    Business Logic:
    1. Validate all products exist
    2. Check if sufficient stock is available
    3. Calculate total cost
    4. Deduct product quantities
    5. Create order and order items
    
    Args:
        db: Database session
        order: Validated order data from Pydantic schema
        buyer_id: ID of the user making the purchase
    
    Returns:
        SQLAlchemy Order model instance
    
    Raises:
        ValueError: If product not found or insufficient stock
    """
    # Step 1: Calculate total and validate items
    total_cost = 0.0
    db_items = []
    
    for item in order.items:  # ← Reading from Pydantic schema
        # Query the database for the product
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        
        # Business rule: Product must exist
        if not product:
            raise ValueError(f"Product {item.product_id} not found")
        
        # Business rule: Must have enough stock
        if product.quantity < item.quantity:
            raise ValueError(f"Not enough quantity for {product.title}")
        
        # Business logic: Calculate item total
        item_total = float(product.price) * item.quantity
        total_cost += item_total
        
        # Business logic: Deduct quantity from inventory
        product.quantity -= item.quantity
        
        # Prepare order item data
        db_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price_of_item": product.price
        })
    
    # Step 2: Create the Order (using SQLAlchemy Model)
    db_order = Order(
        buyer_id=buyer_id,
        total_cost=total_cost,
        shipping_type=order.shipping_type,
        shipping_address=order.shipping_address,
        shipping_status='Pending'
    )
    db.add(db_order)
    db.commit()  # ← Save to database
    db.refresh(db_order)  # ← Get the generated order_id from DB
    
    # Step 3: Create Order Items
    for item_data in db_items:
        db_item = OrderItem(
            order_id=db_order.order_id,
            **item_data
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order  # ← Returns SQLAlchemy model

def get_orders(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Retrieve all orders for a specific user.
    """
    return db.query(Order).filter(Order.buyer_id == user_id).offset(skip).limit(limit).all()

def update_order_status(db: Session, order_id: int, status: str):
    """
    Update the shipping status of an order.
    """
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if order:
        order.shipping_status = status
        db.commit()
        db.refresh(order)
    return order
```

**Key Points:**
- CRUD functions are **reusable** - can be called from multiple endpoints
- Contains **business logic** (stock validation, price calculation)
- Works with **SQLAlchemy models**, not Pydantic schemas
- Returns SQLAlchemy objects (endpoints convert them to JSON)

---

## Layer 4: Models (Database Tables)

**Location:** `backend/app/models/`

### Purpose
Define the actual database tables using **SQLAlchemy ORM**. These are Python classes that map to database tables.

### What Models Know About
- ✅ Table names
- ✅ Column names and types
- ✅ Relationships between tables (ForeignKey, relationship)
- ✅ Database constraints (nullable, unique, default values)

### What Models DON'T Know About
- ❌ HTTP or JSON
- ❌ Business logic
- ❌ API validation rules

### Real Example: Order Models

**File:** `backend/app/models/order.py`

```python
from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


class Order(Base):
    """
    Order table - stores customer orders
    
    Database table: 'orders'
    """
    __tablename__ = "orders"

    # Columns
    order_id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    payment_id = Column(Integer, nullable=True)
    total_cost = Column(Numeric, nullable=False)
    shipping_type = Column(String, nullable=False)  # 'Local Pickup', 'Shipping'
    shipping_status = Column(String, default='Not Shipped')
    shipping_address = Column(String)

    # Relationships (how tables connect to each other)
    buyer = relationship("User", backref="orders")  # ← Links to User model


class OrderItem(Base):
    """
    OrderItem table - individual items within an order
    
    Database table: 'order_items'
    """
    __tablename__ = "order_items"

    order_item_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.product_id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_of_item = Column(Numeric, nullable=False)

    # Relationships
    product = relationship("Product")
    order = relationship("Order", backref="items")


class Payment(Base):
    """
    Payment table - payment information for orders
    
    Database table: 'payment'
    """
    __tablename__ = "payment"

    payment_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False)
    payment_type = Column(String, nullable=False)  # 'MPESA', 'Visa', etc.
    payment_amount = Column(Numeric, nullable=False)
    currency = Column(String, default='USD')
    payment_status = Column(Boolean, default=False)

    # Relationships
    order = relationship("Order", backref="payments")
```

**How SQLAlchemy Uses This:**

When you create an Order object in Python:
```python
db_order = Order(
    buyer_id=1,
    total_cost=99.99,
    shipping_type='Shipping'
)
db.add(db_order)
db.commit()
```

SQLAlchemy generates this SQL:
```sql
INSERT INTO orders (buyer_id, total_cost, shipping_type, shipping_status)
VALUES (1, 99.99, 'Shipping', 'Not Shipped');
```

**Relationships Explained:**
```python
buyer = relationship("User", backref="orders")
```
This means:
- `order.buyer` returns the User object who placed the order
- `user.orders` returns all orders for that user

---

## Complete Request Flow Example

Let's trace a complete order creation from client to database and back:

### 1️⃣ Client Sends Request

```http
POST /api/v1/checkout
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "shipping_type": "Shipping",
  "shipping_address": "123 Main St, Phoenix, AZ",
  "items": [
    {"product_id": 5, "quantity": 2},
    {"product_id": 8, "quantity": 1}
  ]
}
```

---

### 2️⃣ ENDPOINT Receives Request

**File:** `api/v1/endpoints/orders.py`

```python
@router.post("/checkout", response_model=Order)
def checkout(
    order: OrderCreate,  # ← Pydantic validates JSON here
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ← JWT token validated
):
    return create_order(db=db, order=order, buyer_id=current_user.user_id)
```

**What Happens:**
- FastAPI extracts JWT token from `Authorization` header
- `get_current_user` decodes token and retrieves user (user_id=1)
- JSON body is validated against `OrderCreate` schema
- If validation passes, calls `create_order()`

---

### 3️⃣ SCHEMA Validates Data

**File:** `schemas/order.py`

```python
class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
```

**Validation Checks:**
- Is `shipping_type` a string? ✅
- Is `items` a list? ✅
- Does each item have `product_id` (int) and `quantity` (int)? ✅
- If any check fails → 422 Unprocessable Entity error

---

### 4️⃣ CRUD Processes Order

**File:** `crud/order.py`

```python
def create_order(db: Session, order: OrderCreate, buyer_id: int):
    total_cost = 0.0
    
    # For product_id=5, quantity=2
    product = db.query(Product).filter(Product.product_id == 5).first()
    # SQL: SELECT * FROM product WHERE product_id = 5
    
    if product.quantity < 2:
        raise ValueError("Not enough stock")  # Business rule
    
    total_cost += float(product.price) * 2  # Business logic
    product.quantity -= 2  # Update stock
    
    # ... same for product_id=8 ...
    
    # Create Order using MODEL
    db_order = Order(
        buyer_id=1,
        total_cost=119.97,
        shipping_type="Shipping",
        shipping_address="123 Main St, Phoenix, AZ",
        shipping_status="Pending"
    )
    db.add(db_order)
    db.commit()  # SQL: INSERT INTO orders ...
    
    return db_order  # Returns SQLAlchemy model instance
```

---

### 5️⃣ MODEL Saves to Database

**File:** `models/order.py`

```python
class Order(Base):
    __tablename__ = "orders"
    order_id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer, ForeignKey("users.user_id"))
    # ...
```

**SQL Generated:**
```sql
INSERT INTO orders (buyer_id, total_cost, shipping_type, shipping_address, shipping_status)
VALUES (1, 119.97, 'Shipping', '123 Main St, Phoenix, AZ', 'Pending')
RETURNING order_id;  -- Returns 42
```

---

### 6️⃣ Response Serialization

**Back in endpoint:**
```python
@router.post("/checkout", response_model=Order)  # ← Pydantic schema
def checkout(...):
    return create_order(...)  # Returns SQLAlchemy Order object
```

**What Happens:**
- CRUD returns: `Order(order_id=42, buyer_id=1, total_cost=119.97, ...)`
- FastAPI sees `response_model=Order` (Pydantic schema)
- Automatically converts SQLAlchemy object → Pydantic model → JSON

**File:** `schemas/order.py`
```python
class Order(OrderInDBBase):
    order_id: int
    buyer_id: int
    total_cost: float
    items: List[OrderItem]
    
    class Config:
        from_attributes = True  # ← Makes conversion possible
```

---

### 7️⃣ Client Receives Response

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "order_id": 42,
  "buyer_id": 1,
  "total_cost": 119.97,
  "shipping_type": "Shipping",
  "shipping_address": "123 Main St, Phoenix, AZ",
  "shipping_status": "Pending",
  "payment_id": null,
  "items": [
    {
      "order_item_id": 101,
      "product_id": 5,
      "quantity": 2,
      "price_of_item": 49.99
    },
    {
      "order_item_id": 102,
      "product_id": 8,
      "quantity": 1,
      "price_of_item": 19.99
    }
  ]
}
```

---

## Why Separate These Layers?

### ✅ 1. **Reusability**
CRUD functions can be used in multiple places:
- REST API endpoints
- GraphQL resolvers
- Background tasks
- Admin scripts
- Testing

### ✅ 2. **Testability**
Each layer can be tested independently:

```python
# Test CRUD without HTTP
def test_create_order():
    order_data = OrderCreate(
        shipping_type="Shipping",
        items=[OrderItemCreate(product_id=1, quantity=2)]
    )
    order = create_order(db, order_data, buyer_id=1)
    assert order.total_cost > 0
```

### ✅ 3. **Maintainability**
Each layer has a single responsibility:
- Need to change database structure? → Update **Models**
- Need to change API response format? → Update **Schemas**
- Need to change business rules? → Update **CRUD**
- Need to add authentication? → Update **Endpoints**

### ✅ 4. **Team Collaboration**
Different team members can work on different layers without conflicts:
- Backend developer A: Works on CRUD functions
- Backend developer B: Works on new endpoints
- Database admin: Works on models/migrations

### ✅ 5. **Flexibility**
Easy to swap implementations:
- Switch from PostgreSQL to MySQL? → Update Models, CRUD stays same
- Switch from REST to GraphQL? → Update Endpoints, CRUD stays same
- Add new validation rules? → Update Schemas, others stay same

---

## Quick Reference: Layer Comparison

| Layer | Files | Framework | Purpose | Input | Output |
|-------|-------|-----------|---------|-------|--------|
| **Endpoints** | `api/v1/endpoints/*.py` | FastAPI | Handle HTTP | HTTP Request | HTTP Response |
| **Schemas** | `schemas/*.py` | Pydantic | Validate data | JSON / Python dict | Validated Python object |
| **CRUD** | `crud/*.py` | SQLAlchemy | Business logic | Pydantic objects | SQLAlchemy objects |
| **Models** | `models/*.py` | SQLAlchemy | Database tables | Python objects | Database rows |

### What Each Layer Knows

|  | HTTP | JSON | Database | Business Logic |
|--|------|------|----------|----------------|
| **Endpoints** | ✅ | ✅ | ❌ | ❌ |
| **Schemas** | ❌ | ✅ | ❌ | ❌ |
| **CRUD** | ❌ | ❌ | ✅ | ✅ |
| **Models** | ❌ | ❌ | ✅ | ❌ |

### When to Edit Each Layer

| Scenario | Layer to Edit |
|----------|---------------|
| Add new API endpoint | **Endpoint** |
| Change response format | **Schema** |
| Add validation rule | **Schema** |
| Change business logic | **CRUD** |
| Add database column | **Model** + migration |
| Add table relationship | **Model** |
| Change authentication | **Endpoint** + dependencies |

---

## Additional Resources

- **[Backend Documentation](backend_documentation.md)** - Complete backend reference
- **[Developer Setup Guide](guides/setup.md)** - Local environment setup
- **[AWS Infrastructure](architecture/infrastructure.md)** - Deployment details
- **FastAPI Documentation** - https://fastapi.tiangolo.com/
- **Pydantic Documentation** - https://docs.pydantic.dev/
- **SQLAlchemy Documentation** - https://docs.sqlalchemy.org/

---

**Last Updated:** February 11, 2026
