# Backend Codebase Documentation

This document explains the structure and purpose of the backend code for our application. The backend is built using **FastAPI** (Python), which is known for being fast and easy to use for building REST APIs.

> 📚 **New to the backend architecture?** Check out **[Backend Architecture Pipeline](backend_architecture_pipeline.md)** for a detailed explanation of how Models, Schemas, CRUD, and Endpoints work together with complete code examples.

## 1. Top-Level Structure

When you open the `backend/` folder, here is what you see and what it means:

| File / Folder | Purpose in Simple Terms |
| :--- | :--- |
| **`app/`** | This is where all the actual code lives. It contains the logic, database connections, and API definitions. |
| **`.ebextensions/`** | **Deployment Config**. These are special files for AWS Elastic Beanstalk. They tell AWS how to set up the server (like installing software) when we deploy. |
| **`.elasticbeanstalk/`** | **Configuration**. Contains settings specifically for the AWS command-line tool to know which environment to talk to. |
| **`scripts/`** | This is where utility scripts live. |
| **`application.py`** | **Entry Point (AWS)**. This file is required by AWS Elastic Beanstalk to start our application. It just imports our main app. |
| **`requirements.txt`** | **Dependency List**. A list of all the Python libraries (like 'FastAPI', 'SQLAlchemy') our project needs to run. Installing this sets up the environment. |

## 1.1 Deployment & Infrastructure
**We run on AWS.**
For details on how this code gets to the cloud and connects to the database, see **[AWS Infrastructure](architecture/infrastructure.md)**.
- **Server**: AWS Elastic Beanstalk (Python 3.11)
- **Database**: AWS RDS (PostgreSQL) - Connection details are read from Environment Variables (`POSTGRES_SERVER`, etc.).

---

## 2. The `app` Folder Breakdown

This is the heart of the backend.

### `app/main.py`
**The Main Application File.**
- **What it does**: Initializes the `FastAPI` app.
- **Key Actions**:
    - Connects to the database (`engine`).
    - Creates tables if they don't exist (`Base.metadata.create_all`).
    - Sets up **CORS** (security rules) to allow the mobile app to talk to it.
    - Includes the router from `api/v1/api.py` so all URLs work.

### `app/api/v1/endpoints/` (The API Routes)
This folder defines the "URLs" our mobile app can visit.

#### **`auth.py`** (Authentication)
*Handles session identity and onboarding.*
- **GET `/me`**:
    - **Input**: Requires a valid Cognito ID Token.
    - **Action**: Triggers JIT provisioning if the user is new.
    - **Output**: Returns the current user's profile and `is_onboarded` status.
- **POST `/onboard`**:
    - **Input**: Full profile data (City, Country, Bio, etc.).
    - **Action**: Completes the skeleton record and sets `is_onboarded = True`.
    - **Output**: The completed user profile.

#### **`products.py`** (Marketplace Items)
*Handles listing and creating items.*
- **GET `/`**:
    - **Input**: Optional `skip` (for pagination) and `limit` (how many to show).
    - **Output**: A list of products.
- **POST `/`**:
    - **Input**: Title, Price, Description, Image URLs.
    - **Action**: Saves new item to DB with the current user as the `seller_id`.
- **GET `/{id}`**:
    - **Output**: Details of a single specific product.

### `app/models/` (The Database Tables)
This section lists exactly what data we store for each feature.

#### **`User` Table** (`user.py`)
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `user_id` | Integer | Unique ID for the user. |
| `cognito_sub` | String | Unique UUID from Cognito (Linking Key). |
| `email` | String | User's email address. |
| `is_onboarded` | Boolean | Profile completion status. |
| `city / country / bio` | String | Extended profile metadata. |
| `role` | String | 'buyer', 'seller', or 'admin'. |
| `twofa_enabled` | Boolean | Is Two-Factor Auth turned on? |

#### **`Product` Table** (`product.py`)
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `product_id` | Integer | Unique ID for the item. |
| `seller_id` | Integer | Links to the `User` who is selling this. |
| `title` | String | Name of the item. |
| `price` | Numeric | Cost of the item. |
| `product_listing_type` | String | 'Auction', 'Buy it now', or 'Both'. |
| `images` | String | JSON list of image URLs. |

#### **`Order` Table** (`order.py`)
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `order_id` | Integer | Unique transaction ID. |
| `buyer_id` | Integer | Links to the `User` who bought it. |
| `total_cost` | Numeric | Final price paid. |
| `shipping_status` | String | 'Not Shipped', 'Shipped', etc. |

---

## 3. Key Concepts for the Team

### Schemas (`app/schemas/`)
These are **"Gatekeepers"**. Before data reaches the logic, schemas check if it's valid.

**Example:** `UserOnboard` schema ensures all required profile fields are provided.
```python
# In schemas/user.py
class UserOnboard(BaseModel):
    full_name: str
    user_name: str
    phone_number: str
    address: str
    city: str
    country: str
    role: str = "buyer"
```

### CRUD (`app/crud/`)
These files contain the raw database logic. If we want to change *how* we update a user profile, we change it in `crud/user.py`.

**Example:**
```python
# In crud/user.py
def onboard_user(db: Session, user: User, onboard_data):
    user.full_name = onboard_data.full_name
    user.is_onboarded = True
    db.commit()
    db.refresh(user)
    return user
```

###Dependencies (`app/api/dependencies.py`)
Helper functions used by routes. The most important one is `get_current_user`, which checks the security token and figures out *who* is making the request.

**Example:**
```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Decode JWT token
    # Verify it's valid
    # Return the User object
    return user
```

---

## 4. API Endpoint Examples

### Authentication & Onboarding

#### POST `/api/v1/auth/onboard` (Requires Cognito JWT)

**Request:**
```json
{
  "full_name": "John Doe",
  "user_name": "john_doe",
  "phone_number": "+1234567890",
  "address": "123 Main St",
  "city": "Nairobi",
  "country": "Kenya",
  "role": "buyer"
}
```

**Response (200 OK):**
```json
{
  "user_id": 1,
  "email": "john@example.com",
  "user_name": "john_doe",
  "is_onboarded": true,
  "created_at": "2026-02-10T10:30:00Z"
}
```

#### GET `/api/v1/auth/me` (Requires Cognito JWT)

**Response (200 OK):**
```json
{
  "user_id": 1,
  "email": "john@example.com",
  "user_name": "john_doe",
  "is_onboarded": true
}
```

### Product Endpoints

#### GET `/api/v1/products?skip=0&limit=10`

**Response (200 OK):**
```json
[
  {
    "product_id": 1,
    "title": "Handmade Basket",
    "price": 25.99,
    "description": "Traditional woven basket",
    "product_listing_type": "Buy it now",
    "images": "[\"https://bucket.s3.amazonaws.com/img1.jpg\"]",
    "seller_id": 2,
    "created_at": "2026-02-08T15:20:00Z"
  },
  {
    "product_id": 2,
    "title": "Vintage Camera",
    "price": 150.00,
    "product_listing_type": "Auction",
    "images": "[\"https://bucket.s3.amazonaws.com/img2.jpg\"]",
    "seller_id": 3
  }
]
```

#### POST `/api/v1/products` (Requires Authentication)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "title": "Leather Bag",
  "price": 45.00,
  "description": "Handcrafted leather messenger bag",
  "product_listing_type": "Buy it now",
  "images": "[\"https://bucket.s3.amazonaws.com/bag.jpg\"]"
}
```

**Response (201 Created):**
```json
{
  "product_id": 15,
  "title": "Leather Bag",
  "price": 45.00,
  "seller_id": 1,
  "created_at": "2026-02-10T12:00:00Z"
}
```

---

## 5. Database Relationships

Here's how the tables connect to each other:

```mermaid
erDiagram
    User ||--o{ Product : "sells"
    User ||--o{ Order : "places"
    User ||--o{ Bid : "makes"
    User ||--o{ Review : "writes"
    Product ||--o{ Order : "contains"
    Product ||--o| Auction : "has"
    Auction ||--o{ Bid : "receives"
    Order ||--o{ Review : "gets"
    
    User {
        int user_id PK
        string cognito_sub
        string email
        string user_name
        bool is_onboarded
        string role
        bool twofa_enabled
    }
    
    Product {
        int product_id PK
        int seller_id FK
        string title
        decimal price
        string product_listing_type
        string images
    }
    
    Order {
        int order_id PK
        int buyer_id FK
        int product_id FK
        decimal total_cost
        string shipping_status
    }
    
    Auction {
        int auction_id PK
        int product_id FK
        decimal starting_price
        datetime end_time
        string status
    }
    
    Bid {
        int bid_id PK
        int auction_id FK
        int bidder_id FK
        decimal amount
        datetime created_at
    }
    
    Review {
        int review_id PK
        int order_id FK
        int reviewer_id FK
        int rating
        string comment
    }
```

### Key Relationships:

1. **User → Product**: One user (seller) can have many products
2. **User → Order**: One user (buyer) can have many orders
3. **Product → Order**: Products are purchased through orders
4. **Product → Auction**: A product can optionally have an auction
5. **Auction → Bid**: Each auction receives multiple bids
6. **Order → Review**: Completed orders can have reviews

---

## 6. Authentication & Security

### How Cognito JWT Tokens Work

1. **User logs in** via Amplify (Cognito) on the mobile device.
2. **Amplify returns** an ID Token (JWT).
3. **Mobile app attaches** the token to all API requests via an interceptor.
4. **Backend verifies** the token signature using the **RS256** algorithm and Cognito's public key set (JWKS).
5. **Claims Validation**: The backend checks the `iss`, `aud`, and `exp` claims.
6. **JIT Provisioning**: If the `sub` claim is new to our database, a skeleton record is created.

### Database Security

- Relational metadata is stored in **AWS RDS**.
- Identity management (passwords, MFA) is **offloaded to AWS Cognito**.
- The backend never sees or stores user passwords.

---

## 7. Error Handling Patterns

### Standard Error Responses

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Handling in Code

```python
from fastapi import HTTPException, status

@router.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found"
        )
    return product
```

---

## 8. Adding a New Feature (Step-by-Step)

Let's say you want to add a "Wishlist" feature:

### Step 1: Create the Model
```python
# app/models/wishlist.py
from sqlalchemy import Column, Integer, ForeignKey
from app.db.base import Base

class Wishlist(Base):
    __tablename__ = "wishlist"
    
    wishlist_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    product_id = Column(Integer, ForeignKey("product.product_id"))
```

### Step 2: Create the Schema
```python
# app/schemas/wishlist.py
from pydantic import BaseModel

class WishlistCreate(BaseModel):
    product_id: int

class WishlistResponse(BaseModel):
    wishlist_id: int
    user_id: int
    product_id: int
    
    class Config:
        orm_mode = True
```

### Step 3: Create CRUD Functions
```python
# app/crud/wishlist.py
def add_to_wishlist(db: Session, user_id: int, product_id: int):
    wishlist_item = Wishlist(user_id=user_id, product_id=product_id)
    db.add(wishlist_item)
    db.commit()
    return wishlist_item
```

### Step 4: Create the API Endpoint
```python
# app/api/v1/endpoints/wishlist.py
@router.post("/", response_model=WishlistResponse)
def add_to_wishlist(
    wishlist: WishlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.add_to_wishlist(db, current_user.user_id, wishlist.product_id)
```

### Step 5: Register the Router
```python
# app/api/v1/api.py
from app.api.v1.endpoints import wishlist

api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
```

---

## 9. Useful Commands

```bash
# Run backend locally
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Create a database migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# Check database connection
PYTHONPATH=. python scripts/check_db.py

# Run tests (if available)
pytest

# Format code
black app/
isort app/
```

---

**For more information:** See [Developer Setup Guide](guides/setup.md) for environment setup.
