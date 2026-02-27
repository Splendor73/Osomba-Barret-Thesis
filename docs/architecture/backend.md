# Backend Architectural Refinement: Master Plan
## Transitioning Osomba to Scalable MVC + DI + Service/Repository

**Version:** 2.0 (Merged Final)
**Status:** Single Source of Truth
**Source Inputs:**
- `docs/backend_dependency_injection_guide.md`
- `docs/backend_di_refinement_plan.md`
- `docs/backend_mvc_architecture.md`
- `docs/backend_mvc_refinement_plan.md`
- Prior drafts: `docs/backend_refactoring_master_plan.md`, `docs/backend_refactorization_master_plan.md`

---

## 1. Executive Summary

This master plan defines the architectural transition of the Osomba Marketplace backend from a CRUD-centric structure to a robust, enterprise-grade **Controller-Service-Repository** pattern. By decoupling business logic from HTTP concerns and database persistence, we ensure the system remains maintainable, testable, and scalable as the marketplace grows.

### Vision
Our goal is to implement a strict separation of concerns where each layer has a single, well-defined responsibility:
- **Controller (Endpoint)**: Handles HTTP request parsing, input validation (via Schemas), and response orchestration. It acts as a thin entry point.
- **Service Layer**: The "Brain" of the application. Encapsulates all domain logic, business rules, and multi-repository orchestration.
- **Repository (CRUD)**: Provides a clean abstraction for database operations. It handles raw persistence logic without business policy.
- **Model (SQLAlchemy)**: Defines the authoritative database schema and relationships.
- **Schema (Pydantic)**: Defines the API contract, ensuring data integrity for both incoming requests and outgoing responses.

This architecture enables **unit testing business logic in isolation** from the database and web framework, while providing a clear "one-way" data flow.

---

## 2. Current State (As-Is)

## 2.1 Real current flow patterns in this repo

Pattern A (most modules):
`Endpoint -> CRUD -> DB`

Pattern B (partial improvement in payments):
`Endpoint -> Service (static methods) -> DB`

Pattern C (auth/JIT side effects in dependency):
`Endpoint -> get_current_user dependency (business logic + writes) -> DB`

## 2.2 Current code examples

### Example: products endpoint calls CRUD directly
**File:** `backend/app/api/v1/endpoints/products.py`

```python
@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_new_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_product(db=db, product=product, seller_id=current_user.user_id)
```

### Example: orders business logic is inside CRUD
**File:** `backend/app/crud/order.py`

```python
def create_order(db: Session, order: OrderCreate, buyer_id: int):
    for item in order.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        if not product:
            raise ValueError(f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise ValueError(f"Not enough quantity for {product.title}")
        product.quantity -= item.quantity
    ...
```

### Example: auth dependency currently performs provisioning logic
**File:** `backend/app/api/dependencies.py`

`get_current_user()` currently:
1. verifies token
2. queries users
3. re-links orphaned users
4. provisions new users
5. commits DB writes

This is domain orchestration living in a dependency function.

## 2.3 Current issues to address

1. Business rules are spread across endpoints, dependencies, and CRUD.
2. Endpoint and persistence concerns are tightly coupled.
3. CRUD is not consistently a repository-only layer.
4. DI exists but is not standardized for service injection.
5. Error model is inconsistent (`ValueError`, `HTTPException`, ad-hoc catches).

---

## 3. Target Architecture (To-Be)

## 3.1 Layer map

| Layer | Responsibility | Directory | Rule |
| --- | --- | --- | --- |
| Controller | HTTP request/response | `backend/app/api/v1/endpoints/` | No business rules or DB orchestration |
| Service | Domain logic/orchestration | `backend/app/services/` | One service per domain capability |
| Repository | Data access only | `backend/app/crud/` | Query/insert/update only |
| Model | Persistence schema | `backend/app/models/` | SQLAlchemy entities |
| View/Schema | API contract | `backend/app/schemas/` | Pydantic request/response models |
| DI Providers | Dependency assembly | `backend/app/api/dependencies.py` | Typed providers and aliases |

## 3.2 Target request lifecycle

`Client -> Controller -> Service -> Repository -> DB -> Service -> Schema -> Response`

## 3.3 DI rule

Use FastAPI `Depends` with typed aliases (`Annotated`) for:
- DB session
- Current user
- Domain services

No manual service construction inside endpoint methods.

---

## 4. Core Principles for Developers

1. Endpoints must be thin.
2. Services own business policy.
3. Repositories do persistence only.
4. Models define database shape.
5. Schemas define public API shape.
6. Exceptions are standardized and mapped centrally.

### Quick decision guide

| If you are in... | Ask yourself... | Action |
| --- | --- | --- |
| Endpoint | "Am I checking business rules?" | Move to Service |
| Service | "Am I returning HTTP status codes?" | Raise domain exceptions; let controller/handlers map |
| CRUD/Repository | "Am I doing policy/calculations?" | Move to Service |

---

## 5. Detailed Refactor Plan by Phase

## Phase 0: Baseline and Guardrails

### Current approach
Refactor risk is high because several domains have mixed concerns.

### New approach
Establish a safety baseline before code movement.

### Actions
1. Ensure current integration tests pass or known failures are documented.
2. Add baseline tests for high-risk domains (`auth`, `orders`, `auctions`).
3. Freeze endpoint contracts before migration.

### Acceptance criteria
1. Known current behavior documented.
2. Tests can detect behavioral regression.

---

## Phase 1: Standardize Dependency Contracts

### Current approach
Inline dependencies repeated in every endpoint:
- `db: Session = Depends(get_db)`
- `current_user: User = Depends(get_current_user)`

### New approach
Add typed aliases and provider functions in `backend/app/api/dependencies.py`.

### Code example

```python
# backend/app/api/dependencies.py
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User

SessionDep = Annotated[Session, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]

# Provider functions

def get_product_service(db: SessionDep) -> "ProductService":
    return ProductService(db)

ProductServiceDep = Annotated["ProductService", Depends(get_product_service)]
```

### Acceptance criteria
1. Endpoints start using dependency aliases.
2. New service providers are centralized.

---

## Phase 2: Convert Controllers to Service-Oriented Flow

### Current approach
Endpoints directly call CRUD.

### New approach
Endpoints call service methods only.

### Before (current style)

```python
# backend/app/api/v1/endpoints/products.py
from app.crud.product import create_product

@router.post("/")
def create_new_product(product: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_product(db=db, product=product, seller_id=current_user.user_id)
```

### After (target style)

```python
# backend/app/services/product_service.py
from app.crud import product as product_repo
from app.models.user import User
from app.schemas.product import ProductCreate

class ProductService:
    def __init__(self, db):
        self.db = db

    def create_product(self, product: ProductCreate, current_user: User):
        # Business checks belong here
        return product_repo.create_product(self.db, product, current_user.user_id)

    def list_products(self, skip: int, limit: int):
        return product_repo.get_products(self.db, skip=skip, limit=limit)
```

```python
# backend/app/api/v1/endpoints/products.py
from app.api.dependencies import ProductServiceDep, CurrentUserDep

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_new_product(
    product: ProductCreate,
    service: ProductServiceDep,
    current_user: CurrentUserDep,
):
    return service.create_product(product, current_user)
```

### Acceptance criteria
1. Endpoints stop importing domain CRUD functions directly.
2. Endpoint logic is routing and contract mapping only.

---

## Phase 3: Move Auth/JIT Domain Logic Out of Dependency Layer

### Current approach
`get_current_user` performs provisioning and DB writes.

### New approach
Split concerns:
1. Dependency handles authentication principal extraction.
2. `AuthService` handles JIT/re-link/provision business logic.
3. User repository handles persistence.

### Target service example

```python
# backend/app/services/auth_service.py
from datetime import datetime
from fastapi import HTTPException, status
from app.crud import user as user_repo
from app.models.user import User

class AuthService:
    def __init__(self, db):
        self.db = db

    def get_or_provision_user(self, sub: str, email: str, terms_version: str | None, marketing_opt_in: bool = False) -> User:
        user = self.db.query(User).filter(User.cognito_sub == sub).first()
        if user:
            return user

        orphan = user_repo.get_user_by_email(self.db, email)
        if orphan:
            orphan.cognito_sub = sub
            if terms_version:
                orphan.terms_version = terms_version
                orphan.marketing_opt_in = marketing_opt_in
                orphan.accepted_terms_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(orphan)
            return orphan

        if not terms_version:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="terms_version is required for initial user provisioning",
            )

        user = User(
            cognito_sub=sub,
            email=email,
            is_onboarded=False,
            accepted_terms_at=datetime.utcnow(),
            terms_version=terms_version,
            marketing_opt_in=marketing_opt_in,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
```

### Acceptance criteria
1. `get_current_user` no longer orchestrates domain writes.
2. JIT logic is testable via service unit tests.

---

## Phase 4: Repository Cleanup (CRUD = Data Access Only)

### Current approach
`crud/order.py`, `crud/auction.py`, `crud/review.py` include policy/business rules.

### New approach
Convert CRUD into repository-style persistence helpers.

### Example split for orders

```python
# backend/app/crud/order.py
class OrderRepository:
    def __init__(self, db):
        self.db = db

    def add_order(self, buyer_id: int, shipping_type: str, shipping_address: str, total_cost: float):
        order = Order(...)
        self.db.add(order)
        self.db.flush()
        return order

    def add_order_item(self, order_id: int, product_id: int, quantity: int, price_of_item):
        item = OrderItem(...)
        self.db.add(item)
        return item
```

```python
# backend/app/services/order_service.py
class OrderService:
    def __init__(self, db):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)

    def checkout(self, order_in: OrderCreate, buyer_id: int):
        # validate inventory
        # calculate totals
        # update product quantities
        # persist order + items transactionally
        ...
```

### Acceptance criteria
1. CRUD modules are query/write only.
2. Services own all business validation and orchestration.

---

## Phase 5: Normalize Service Construction and DI Providers

### Current approach
`PaymentService` uses static methods and takes `db` as method arg.

### New approach
Use instance-based services for all domains.

### Code example

```python
# backend/app/services/payment/service.py
class PaymentService:
    def __init__(self, db):
        self.db = db

    async def initiate_payment(self, payment_data: PaymentInitiate):
        ...
```

```python
# backend/app/api/dependencies.py

def get_payment_service(db: SessionDep) -> PaymentService:
    return PaymentService(db)

PaymentServiceDep = Annotated[PaymentService, Depends(get_payment_service)]
```

```python
# backend/app/api/v1/endpoints/payments.py
@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(
    payment_data: PaymentInitiate,
    service: PaymentServiceDep,
    current_user: CurrentUserDep,
):
    return await service.initiate_payment(payment_data)
```

### Acceptance criteria
1. Services are injected, not manually created in endpoints.
2. Providers are centralized in dependencies.

---

## Phase 6: Unified Error Model and Exception Handling

### Current approach
Mixed strategy (`ValueError`, `HTTPException`, local catches).

### New approach
1. Create domain exceptions in `backend/app/core/exceptions.py`.
2. Services/repositories raise domain exceptions.
3. App-level handlers map domain exceptions to HTTP.

### Code example

```python
# backend/app/core/exceptions.py
class DomainError(Exception):
    pass

class NotFoundError(DomainError):
    pass

class ValidationError(DomainError):
    pass
```

```python
# backend/app/main.py
from fastapi.responses import JSONResponse
from app.core.exceptions import NotFoundError

@app.exception_handler(NotFoundError)
async def not_found_handler(_, exc: NotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})
```

### Acceptance criteria
1. Domain exception usage is consistent.
2. Controllers stop generic try/except for core domain cases.

---

## Phase 7: Test Strategy After Refactor

### Test layering targets
1. Controller tests: HTTP contract and DI wiring.
2. Service tests: business policy and orchestration.
3. Repository tests: persistence correctness.

### Example structure
1. `backend/tests/services/test_order_service.py`
2. `backend/tests/api/test_orders_endpoint.py`
3. `backend/tests/repositories/test_order_repository.py`

### Acceptance criteria
1. Each migrated domain has service tests.
2. API tests validate response contracts and status mapping.

---

## 6. Domain Migration Priority

Migrate in this order to reduce risk:
1. `products` (low complexity, establishes pattern)
2. `orders` (critical business orchestration)
3. `auth` (JIT split from dependency)
4. `auctions` (complex rule extraction)
5. `messages`, `notifications`, `reviews` (lighter domains)
6. `payments` (finish DI normalization and provider architecture)

---

## 7. Future Feature Development Standard (Mandatory)

For every new backend feature:
1. Add schema (`backend/app/schemas/<feature>.py`)
2. Add model (`backend/app/models/<feature>.py`)
3. Add repository methods (`backend/app/crud/<feature>.py`)
4. Add service (`backend/app/services/<feature>_service.py`)
5. Add provider and alias (`backend/app/api/dependencies.py`)
6. Add endpoint (`backend/app/api/v1/endpoints/<feature>.py`)
7. Register route (`backend/app/api/v1/api.py`)
8. Add tests by layer (service then endpoint)

### Endpoint template

```python
@router.post("/", response_model=FeatureOut, status_code=status.HTTP_201_CREATED)
def create_feature(
    payload: FeatureCreate,
    service: FeatureServiceDep,
    current_user: CurrentUserDep,
):
    return service.create_feature(payload, current_user)
```

### Service template

```python
class FeatureService:
    def __init__(self, db):
        self.db = db
        self.repo = FeatureRepository(db)

    def create_feature(self, payload: FeatureCreate, current_user: User):
        # business rules
        return self.repo.create(...)
```

---

## 8. Delivery Plan (Sprint/PR Friendly)

### Sprint 1
1. Phase 0 + Phase 1
2. Migrate `products`

### Sprint 2
1. Migrate `orders`
2. Start `auth` split

### Sprint 3
1. Complete `auth`
2. Migrate `auctions`
3. Normalize `payments` service DI

### Sprint 4
1. Migrate remaining modules
2. Apply unified exception model
3. Complete layered tests and docs refresh

---

## 9. Definition of Done (Per Domain)

A domain is complete only when:
1. Controller is thin (HTTP concerns only)
2. Service contains business logic
3. Repository handles data access only
4. Service DI provider exists and is used
5. Domain exceptions are standardized
6. Service + endpoint tests exist
7. External route contract remains stable unless explicitly planned

---

## 10. Immediate Next Actions (Repository-Specific)

1. Add dependency aliases/providers in `backend/app/api/dependencies.py`.
2. Implement `ProductService` and migrate `products` endpoints first.
3. Implement `OrderService`; move stock/total logic out of `crud/order.py`.
4. Implement `AuthService`; move JIT provisioning out of `get_current_user`.
5. Convert `PaymentService` to instance-based DI.
6. Add `backend/app/core/exceptions.py` and app-level handlers.
7. Add service-layer tests for each migrated domain.

---

## 11. Final Team Reminder

If you are writing backend code and unsure where logic belongs:
- If it is HTTP/route/status related: Controller.
- If it is business decision/policy: Service.
- If it is SQL persistence: Repository.

That rule should drive every PR.


Backend Architectural Refinement: Transitioning to Formal MVC
This document outlines the transition from our current "CRUD-centric" layered architecture to a more formal Model-View-Controller (MVC) pattern with a dedicated Service Layer.

1. Current State vs. Future Goal
Currently, our backend follows a modular structure where endpoints often interact directly with the database via CRUD functions. While clean, this can lead to "fat" controllers or "logic-heavy" CRUD operations as the app grows.

Feature	Current Approach (Layered CRUD)	Future Approach (Refined MVC)
Logic Flow	Endpoint -> CRUD -> DB	Endpoint -> Service -> CRUD -> DB
Business Logic	Often resides in Endpoints or CRUD functions.	Isolated in a dedicated Service layer.
Endpoints	Handle HTTP + basic validation + CRUD calls.	"Thin" - only handle HTTP and call Services.
Reusability	Logic is often tied to a specific HTTP route.	Logic is reusable across CLI, Tasks, and APIs.
2. Component Breakdown & Code Examples
A. The View (Schemas)
Role: Defines the API contract. Validation of input and serialization of output. Location: backend/app/schemas/

# app/schemas/product.py
class ProductCreate(BaseModel):
    title: str
    price: float
    description: str

class ProductResponse(BaseModel):
    product_id: int
    title: str
    # Logic for display happens here
B. The Model (Database)
Role: Represents the data structure in PostgreSQL. Location: backend/app/models/

# app/models/product.py
class Product(Base):
    __tablename__ = "products"
    product_id = Column(Integer, primary_key=True)
    seller_id = Column(Integer, ForeignKey("users.user_id"))
    # ... other fields
C. The Controller (Endpoints) — The Change
Role: Handle HTTP requests. They should be "Thin". Location: backend/app/api/v1/endpoints/

❌ Before (Logic in Endpoint):

@router.post("/")
def create_item(item: ProductCreate, db: Session = Depends(get_db), user = Depends(get_user)):
    # ❌ Logic mixed with HTTP handling
    if user.is_suspended:
        raise HTTPException(403, "Suspended")
    return crud.create_product(db, item, user.id)
✅ After (Thin Controller):

@router.post("/")
def create_item(item: ProductCreate, db: Session = Depends(get_db), user = Depends(get_user)):
    # ✅ Just calls the Service
    return ProductService.list_new_product(db, item, user)
D. The Service Layer — The New Addition
Role: The "Brain" of the application. Handles business rules, external APIs, and complex logic. Location: backend/app/services/

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
3. Drastic Changes & Impact
Creation of app/services/: This directory becomes the home for all non-trivial logic.
Cleaner CRUD: app/crud/ files return to being simple "queries" (Select, Insert, Update) without business rules.
Easier Testing: We can now write unit tests for ProductService without needing to mock complex FastAPI Depends or HTTP requests.
4. Development Workflow for New Features
When building a new feature (e.g., Orders), follow this sequence:

V (View): Create schemas/order.py (What does the JSON look like?).
M (Model): Create models/order.py (How is it stored in SQL?).
D (Data Access): Create crud/order.py (Basic db.add, db.query).
S (Service): Create services/order_service.py (Verify stock, calculate tax, create order).
C (Controller): Create api/v1/endpoints/orders.py (The URL that calls the Service).
Summary for the Team
We are currently 80% compliant with this pattern. The final 20% involves migrating business logic out of endpoints and crud into a dedicated services layer. This will make the Osomba backend "enterprise-ready," easier to debug, and much simpler to test.

