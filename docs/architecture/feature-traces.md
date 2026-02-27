# Feature-Wise Architecture Documentation

This document explains how specific features are built across the entire "Full Stack" of our application. It traces a feature from the button you click on the screen all the way to the database.

---

## 0. The Boundary: Flutter vs. FastAPI

The boundary between our stack components is defined by **credential ownership** and **data responsibility**.

*   **Flutter (Frontend)**: Owns the **Authentication Handshake**. It utilizes the `amplify_auth_flutter` SDK to manage sessions, MFA, and JWT retrieval from AWS Cognito.
*   **FastAPI (Backend)**: Owns **Authorization & Relational Data**. It verifies the Cognito JWT signatures offline using RS256 and manages application-level metadata (profiles, products, orders) in PostgreSQL.

---

## 1. Authentication & Onboarding (Unified Identity)

This feature enables secure user identity management using AWS Cognito and automated record synchronization in the local database.

### **Frontend (Mobile)**
| Layer | File / Component | What it does |
| :--- | :--- | :--- |
| **UI (Auth)** | `amplify_authenticator` | Managed UI component for Sign-in, Sign-up, and MFA. |
| **Logic (Provider)** | `lib/providers/user_provider.dart` | Listens to `Amplify.Hub` events; manages auth state and profile fetching. |
| **Network (Security)** | `lib/services/auth_interceptor.dart` | Automatically fetches Cognito ID Token and injects into all API requests. |
| **UI (Onboarding)** | `lib/screens/auth/onboarding_screen.dart` | Wizard for collecting extended profile data (Bio, City, etc.). |

### **Backend (API)**
| Layer | File / Component | What it does |
| :--- | :--- | :--- |
| **Security (RSA)** | `app/core/security.py` | Verifies Cognito JWT signatures using RS256 and public keys (JWKS). |
| **JIT Logic** | `app/api/dependencies.py` | `get_current_user` creates a skeleton DB record on first successful login. |
| **API Endpoint** | `app/api/v1/endpoints/auth.py` | `/me` returns user status; `/onboard` completes the profile. |
| **Database** | `app/models/user.py` | Stores metadata (`cognito_sub`, `is_onboarded`, `bio`) in PostgreSQL. |

### **Detailed Data Trace: "First Login & Onboarding"**
1. **User Action**: User registers/signs in via the Amplify Authenticator UI.
2. **Cognito Handshake**: Amplify retrieves an **ID Token (JWT)** from AWS Cognito.
3. **Hub Event**: `UserProvider` detects `signedIn` event and calls `AuthService.getProfile()`.
4. **Network Request**: `AuthInterceptor` attaches `Authorization: Bearer <token>` and calls `GET /api/v1/auth/me`.
5. **Backend JIT**: 
    - `get_current_user` verifies the token.
    - If `cognito_sub` is new, it creates a record with `is_onboarded = False`.
6. **Frontend Guard**: `GoRouter` detects `isAuthenticated && !isOnboarded` -> Redirects to `/onboarding`.
7. **User Action**: User fills out the wizard and clicks "Complete Profile".
8. **API Call**: App calls `POST /api/v1/auth/onboard` with profile data.
9. **Final State**: Backend sets `is_onboarded = True`. `UserProvider` refreshes, and the guard allows access to the marketplace.

### ⚡ Just-In-Time (JIT) Provisioning Pattern (Data Sync)
- **Pattern**: Lazy Initialization / JIT
- **Implementation**: `backend/app/api/dependencies.py` -> `get_current_user`
- **Rationale**: Traditional "Post-Confirmation" triggers in AWS Lambda are hard to test and maintain. By provisioning the user record only when they first interact with the API, we ensure that the local DB is always ready exactly when needed.
- **Impact**: Removes the need for complex infrastructure triggers and improves local development isolation.

### 🛡️ Onboarding Guard
- **Pattern**: Navigation Guard / Middleware
- **Implementation**: `mobile/lib/main.dart` -> `_createRouter` (GoRouter redirect)
- **Rationale**: Ensures that business invariants (e.g., "A user must be onboarded to see the marketplace") are enforced at the routing level.
- **Impact**: Provides a foolproof UX where users cannot "skip" required steps via deep links.

---

## 2. Marketplace (Browsing Items)

This feature handles displaying products for sale.

### **Frontend (Mobile)**
| Layer | File / Component | What it does |
| :--- | :--- | :--- |
| **UI (Screen)** | `lib/screens/marketplace/home_screen.dart` | The grid of product images and titles. |
| **UI (Widget)** | `lib/screens/marketplace/widgets/product_card.dart` | A reusable component for a single product. |
| **Logic (Provider)** | `lib/providers/marketplace_provider.dart` | Fetches the list of products on load. Stores the list in memory. |
| **Service (API)** | `lib/services/api_service.dart` | Sends `GET` request to `/api/v1/products`. |

### **Backend (API)**
| Layer | File / Component | What it does |
| :--- | :--- | :--- |
| **Router** | `app/api/v1/endpoints/products.py` | Receives the "Get Products" request. |
| **CRUD** | `app/crud/product.py` | Queries the database for all available items. |
| **Database** | `app/models/product.py` | The SQL Table storing items (`id`, `name`, `price`, `image_url`). |

### **Detailed Data Trace: "Load Products"**
1. **App Start**: `MarketplaceProvider` initializes and calls `loadData()`.
2. **Network Request**: App sends `GET /api/v1/products?limit=100`.
3. **Backend Router**: `products.py` calls `get_products()`.
4. **Database Query**: `SELECT * FROM product LIMIT 100;`.
5. **Response**: Returns JSON list `[{"title": "Shoes", "price": 50}, ...]`.
6. **Mobile Update**: `_products` list is updated. `notifyListeners()` triggers UI rebuild.
7. **User See**: The screen populates with images.

---

## 3. Payments & Orders (High Level)

*Note: This feature involves integrations with external services (like Stripe/AWS).*

### **Frontend (Mobile)**
| Layer | File / Component | What it does |
| :--- | :--- | :--- |
| **UI (Screen)** | `lib/screens/marketplace/cart_screen.dart` | Shows selected items and "Checkout" button. |
| **Logic (Provider)** | `lib/providers/cart_provider.dart` | Calculates total price. Manages adding/removing items. |
| **Service** | `lib/services/payment_service.dart` (If exists) | securely sends credit card info to Stripe. |

### **Backend (API)**
| Layer | File / Component | What it does |
| :--- | :--- | :--- |
| **Router** | `app/api/v1/endpoints/orders.py` | Receives the "Create Order" request after payment. |
| **Logic** | `app/services/payment_gateway.py` | Verifies with Stripe that payment was successful. |
| **Database** | `app/models/order.py` | Records the transaction (`id`, `user_id`, `total_amount`, `status`). |
