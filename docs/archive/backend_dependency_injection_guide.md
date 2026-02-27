# Backend Guide: Dependency Injection (DI)

This document explains what **Dependency Injection** is, why we use it in FastAPI, and how it transforms our application flow.

## 1. What is Dependency Injection?

Dependency Injection (DI) is a design pattern where a function or class **receives** the objects it needs (its dependencies) rather than creating them itself.

In FastAPI, this is handled by the `Depends()` system. It allows us to declare what our code needs, and FastAPI "injects" those requirements at runtime.

---

## 2. The Architectural Shift

We are moving from an **"Inside-Out"** approach to an **"Outside-In"** approach.

### Current Flow (Hardcoded Dependencies)
1. **Endpoint** receives request.
2. **Endpoint** calls a CRUD function.
3. **CRUD function** creates a database query.
*Problem:* If we want to change the database or test the logic without a real DB, it is very hard because the logic is "hardwired" into the functions.

### Future Flow (Dependency Injection)
1. **Request Arrives**: FastAPI sees the endpoint needs a `ProductService`.
2. **Resolution**: FastAPI looks at `ProductService` and sees it needs a `Database Session`.
3. **Injection**: FastAPI creates the `Database Session`, creates the `ProductService`, and hands it to your endpoint.
4. **Execution**: Your endpoint runs with a fully ready service.

---

## 3. Code Comparison

### ❌ The "Manual" Way (Hardcoded)
The endpoint is responsible for creating its own tools.
```python
@router.post("/products")
def create_product(data: ProductCreate):
    # ❌ BAD: The endpoint creates the service instance manually
    service = ProductService() 
    return service.create(data)
```

### ✅ The "DI" Way (FastAPI Style)
The endpoint just asks for what it needs.
```python
@router.post("/products")
def create_product(
    data: ProductCreate, 
    # ✅ GOOD: FastAPI injects the service for us
    service: ProductService = Depends(get_product_service)
):
    return service.create(data)
```

---

## 4. Why This Matters
1.  **Cleaner Code**: No more messy setup logic inside your endpoints.
2.  **Easier Testing**: We can "inject" a fake database or service during tests to make them fast and reliable.
3.  **Loose Coupling**: You can change how a Service works without ever touching the code in your Endpoints.
