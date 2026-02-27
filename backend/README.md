# Osomba Backend API

## 🐍 Project Overview
The backend service for the Osomba Marketplace, built with **FastAPI** (Python). It provides a high-performance, asynchronous REST API to handle users, products, auctions, and orders.

## 🏗 Architecture (Refactored v2)

We follow a strictly layered architecture to decouple business logic from HTTP concerns and database access:
`Model -> Schema -> Service -> Repository (CRUD) -> Endpoint`

### Directory Structure
```
app/
├── main.py              # Application entry point & Middleware
├── core/                # Config & Security (JWT, Hashing)
├── models/              # SQLAlchemy Database Models (The source of truth)
├── schemas/             # Pydantic Schemas (Validation & Serialization)
├── services/            # PURE BUSINESS LOGIC (The "Brain")
│   ├── auction_service.py
│   ├── order_service.py
│   └── product_service.py
├── crud/                # DUMB DATA ACCESS (The "Hands")
│   ├── crud_auction.py
│   └── crud_order.py
└── api/
    ├── dependencies.py  # Dependency Injection (SessionDep, CurrentUserDep)
    └── v1/
        └── endpoints/   # Thin Controllers (HTTP handling only)
```

### Why this architecture?
- **Services**: Contain all business rules (e.g., "Anti-Sniping", "Stock Validation"). They are framework-agnostic and easily unit-testable.
- **Repositories (CRUD)**: Only handle SQL queries. They know *how* to save data but not *why*.
- **Endpoints**: Only handle HTTP requests/responses. They delegate everything to Services.

## ✨ Key Features

### 🔨 Bidding Engine (AuctionService)
Located in `app/services/auction_service.py`.
- **Proxy Bidding**: Users set a max bid, and the Service auto-bids for them up to that amount.
- **Anti-Sniping**: Auctions automatically extend by 10 minutes if a bid is placed in the last 10 minutes.
- **Atomic Operations**: Uses database locks to prevent race conditions during concurrent bidding.

### 📦 Order Processing (OrderService)
Located in `app/services/order_service.py`.
- **Transactional Checkout**: Ensures stock is available and deducted atomically.
- **Secure Calculations**: Total costs (tax, shipping) are calculated on the server.

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env` file in this directory (or rename `.env.example`).
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run the Server
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 3. Documentation
FastAPI automatically generates interactive documentation. Visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🛠 Testing

We use `pytest` with a **Transactional Rollback** strategy.
Tests run against a real database but wrap every test in a transaction that is rolled back at the end. This ensures a clean state for every test without slow manual cleanup.

### Prerequisites
1. Ensure your local Postgres is running.
2. Create the test database:
   ```bash
   python scripts/create_test_db.py
   ```

### Running Tests
```bash
# Run all tests
pytest tests/

# Run only API integration tests
pytest tests/test_api_*.py

# Run specific test file
pytest tests/test_api_products.py
```

## 🧰 Utility Scripts

- **`scripts/cleanup_user.py`**: "Total Reset" a user account in both AWS Cognito and RDS. Useful for E2E testing.
- **`scripts/check_db.py`**: Verifies database connection using current `.env` settings and lists tables.
