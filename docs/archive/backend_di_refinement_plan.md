# Backend Refinement Plan: Implementing Dependency Injection

This plan details the specific code changes required to transition our backend to a full Dependency Injection (DI) architecture.

## 1. The Strategy
We will move away from endpoints calling `crud` functions directly. Instead, endpoints will depend on **Services**, and Services will depend on the **Database**.

---

## 2. Step-by-Step Implementation

### Step 1: Adopt `Annotated` for Dependencies
We will centralize our common dependencies in `app/api/dependencies.py` to keep our code clean.

```python
# app/api/dependencies.py
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

# Create a reusable type for Database Sessions
SessionDep = Annotated[Session, Depends(get_db)]
```

### Step 2: Update Services to Accept DI
Services should now receive their dependencies (like the DB session) in their `__init__` constructor.

```python
# app/services/product_service.py
class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def list_product(self, data: ProductCreate, user_id: int):
        # Service uses the injected 'self.db'
        return crud.create_product(self.db, data, user_id)

# Create a 'provider' function for FastAPI
def get_product_service(db: SessionDep) -> ProductService:
    return ProductService(db)
```

### Step 3: Refactor Endpoints
Endpoints will now stop requesting the `db` and instead request the `Service`.

```python
# app/api/v1/endpoints/products.py
@router.post("/")
def create_new_product(
    product: ProductCreate,
    # ✅ Inject the service instead of the DB session
    service: ProductService = Depends(get_product_service)
):
    return service.list_product(product, user_id=...)
```

---

## 3. What to Change Now? (Roadmap)

To successfully implement this, we need to:

1.  **Create the Directory**: Add `backend/app/services/`.
2.  **Migrate Logic**: Move any complex logic currently in `endpoints/` or `crud/` into new Service classes.
3.  **Update `dependencies.py`**: Add provider functions (like `get_product_service`) for every service we create.
4.  **Refactor Endpoints**: Update one endpoint file at a time (e.g., start with `products.py`, then `auth.py`).

---

## 4. Key Goal for the Team
By the end of this refinement, an Endpoint should be **purely a traffic controller**:
1. It receives the request.
2. It calls the Service.
3. It returns the result.

**No database queries or business rules should live in the Endpoint files.**
