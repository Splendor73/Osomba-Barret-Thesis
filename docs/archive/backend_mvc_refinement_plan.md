# Backend Architectural Refinement: Transitioning to Formal MVC

This document outlines the transition from our current "CRUD-centric" layered architecture to a more formal **Model-View-Controller (MVC)** pattern with a dedicated **Service Layer**.

## 1. Current State vs. Future Goal

Currently, our backend follows a modular structure where endpoints often interact directly with the database via CRUD functions. While clean, this can lead to "fat" controllers or "logic-heavy" CRUD operations as the app grows.

| Feature | Current Approach (Layered CRUD) | Future Approach (Refined MVC) |
| :--- | :--- | :--- |
| **Logic Flow** | `Endpoint -> CRUD -> DB` | `Endpoint -> Service -> CRUD -> DB` |
| **Business Logic** | Often resides in Endpoints or CRUD functions. | Isolated in a dedicated `Service` layer. |
| **Endpoints** | Handle HTTP + basic validation + CRUD calls. | "Thin" - only handle HTTP and call Services. |
| **Reusability** | Logic is often tied to a specific HTTP route. | Logic is reusable across CLI, Tasks, and APIs. |

---

## 2. Component Breakdown & Code Examples

### A. The View (Schemas)
**Role:** Defines the API contract. Validation of input and serialization of output.
**Location:** `backend/app/schemas/`

```python
# app/schemas/product.py
class ProductCreate(BaseModel):
    title: str
    price: float
    description: str

class ProductResponse(BaseModel):
    product_id: int
    title: str
    # Logic for display happens here
```

### B. The Model (Database)
**Role:** Represents the data structure in PostgreSQL.
**Location:** `backend/app/models/`

```python
# app/models/product.py
class Product(Base):
    __tablename__ = "products"
    product_id = Column(Integer, primary_key=True)
    seller_id = Column(Integer, ForeignKey("users.user_id"))
    # ... other fields
```

### C. The Controller (Endpoints) — *The Change*
**Role:** Handle HTTP requests. They should be "Thin".
**Location:** `backend/app/api/v1/endpoints/`

**❌ Before (Logic in Endpoint):**
```python
@router.post("/")
def create_item(item: ProductCreate, db: Session = Depends(get_db), user = Depends(get_user)):
    # ❌ Logic mixed with HTTP handling
    if user.is_suspended:
        raise HTTPException(403, "Suspended")
    return crud.create_product(db, item, user.id)
```

**✅ After (Thin Controller):**
```python
@router.post("/")
def create_item(item: ProductCreate, db: Session = Depends(get_db), user = Depends(get_user)):
    # ✅ Just calls the Service
    return ProductService.list_new_product(db, item, user)
```

### D. The Service Layer — *The New Addition*
**Role:** The "Brain" of the application. Handles business rules, external APIs, and complex logic.
**Location:** `backend/app/services/`

```python
# app/services/product_service.py
class ProductService:
    @staticmethod
    def list_new_product(db: Session, product_in: ProductCreate, user: User):
        # 1. Business Validation
        if user.is_suspended:
            raise BusinessException("User cannot list products")
        
        # 2. Orchestration (e.g., check stock, call image processing)
        
        # 3. Call Data Access
        return crud_product.create_product(db, product_in, user.id)
```

---

## 3. Drastic Changes & Impact

1.  **Creation of `app/services/`**: This directory becomes the home for all non-trivial logic.
2.  **Cleaner CRUD**: `app/crud/` files return to being simple "queries" (Select, Insert, Update) without business rules.
3.  **Easier Testing**: We can now write unit tests for `ProductService` without needing to mock complex FastAPI `Depends` or HTTP requests.

---

## 4. Development Workflow for New Features

When building a new feature (e.g., **Orders**), follow this sequence:

1.  **V (View):** Create `schemas/order.py` (What does the JSON look like?).
2.  **M (Model):** Create `models/order.py` (How is it stored in SQL?).
3.  **D (Data Access):** Create `crud/order.py` (Basic `db.add`, `db.query`).
4.  **S (Service):** Create `services/order_service.py` (Verify stock, calculate tax, create order).
5.  **C (Controller):** Create `api/v1/endpoints/orders.py` (The URL that calls the Service).

---

## Summary for the Team
We are currently **80% compliant** with this pattern. The final 20% involves migrating business logic out of `endpoints` and `crud` into a dedicated `services` layer. This will make the Osomba backend "enterprise-ready," easier to debug, and much simpler to test.
