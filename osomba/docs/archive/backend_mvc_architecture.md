# Backend MVC Architecture Guide

This document explains how the **Model-View-Controller (MVC)** pattern is implemented in the Osomba Marketplace backend and provides a roadmap for future development.

## 1. MVC Component Mapping

In our FastAPI architecture, the MVC components are distributed across specific directories:

| Component | Responsibility | Project Directory | Technology |
| :--- | :--- | :--- | :--- |
| **Model** | Database structure and data access. | `backend/app/models/` | SQLAlchemy |
| **View** | Data validation and JSON serialization. | `backend/app/schemas/` | Pydantic |
| **Controller** | Handling HTTP requests and routing. | `backend/app/api/v1/endpoints/` | FastAPI Routers |
| **CRUD/Repo** | Low-level database operations. | `backend/app/crud/` | SQLAlchemy Sessions |

---

## 2. The Refined Architecture (Layered MVC)

To maintain a scalable codebase, we follow a "Layered Architecture" approach. This separates the HTTP logic from the business logic and the database access.

### The Request Flow:
1. **Client** sends an HTTP request.
2. **Endpoint (Controller)** receives the request and validates the input using a **Schema**.
3. **Service Layer (Business Logic)** *[Recommended Improvement]*: Processes business rules (e.g., "Is the seller active?", "Does the user have enough balance?").
4. **CRUD (Data Access)**: Interacts with the **Model** to perform database queries.
5. **Database** returns data.
6. **Endpoint** returns a JSON response serialized by a **Schema (View)**.

---

## 3. Implementation Details

### Models (The Data)
Located in `app/models/`. These define what the database looks like.
*Example:* `Product` model in `models/product.py`.

### Views/Schemas (The Presentation)
Located in `app/schemas/`. These define what the API user sees.
* **Input Schemas**: `ProductCreate`, `UserLogin`.
* **Output Schemas**: `Product`, `UserResponse`.

### Controllers/Endpoints (The Logic)
Located in `app/api/v1/endpoints/`.
* These should be "thin". They should only handle status codes, dependencies (like `get_db` or `get_current_user`), and calling the logic layer.

---

## 4. Development Workflow

When adding a new feature (e.g., "Reviews"), follow these steps:

1.  **Define the Schema (View):** Create `app/schemas/review.py`.
2.  **Define the Model (Data):** Create `app/models/review.py`.
3.  **Implement CRUD:** Create `app/crud/review.py` for basic DB operations (create, get, list).
4.  **Implement Service (Optional but Recommended):** If there are complex rules (e.g., "A user can only review a product they bought"), create a service.
5.  **Expose Endpoint (Controller):** Create `app/api/v1/endpoints/reviews.py` and register it in `app/api/v1/api.py`.

---

## 5. Benefits of this Approach
*   **Separation of Concerns:** Changing the database schema doesn't break the API contract (Schemas).
*   **Testability:** You can test business logic (Services/CRUD) independently of the web server (FastAPI).
*   **Maintainability:** Team members know exactly where to look for specific logic.
