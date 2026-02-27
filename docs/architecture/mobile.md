# Mobile App Codebase Documentation

This document explains the structure and purpose of the mobile app code. The app is built using **Flutter**, which allows it to run on both iOS and Android from a single codebase.

## 1. Top-Level Structure

When you open the `mobile/` folder, the most important folder is **`lib/`**. This is where 99% of our work happens.

| File / Folder | Purpose in Simple Terms |
| :--- | :--- |
| **`lib/`** | **The Source Code**. Contains all the Dart code for the app. |
| **`pubspec.yaml`** | **Package Manager**. Lists all the external libraries we use (like `provider` for state, `dio` for internet, `go_router` for navigation). |
| **`android/` & `ios/`** | **Native Code**. Auto-generated folders containing platform-specific settings (app icons, permissions). We rarely touch these directly. |
| **`analysis_options.yaml`** | **Code Rules**. Defines the style rules for our code (e.g., "always use double quotes"). Helps keep code clean. |

---

## 2. The `lib` Folder Breakdown

Our app uses a **"Feature-First"** architecture. This means we group code by **what it does** (e.g., "Marketplace", "Login") rather than what kind of file it is.

### `lib/main.dart`
**The App Entry Point.**
- **Initializes Amplify**: Configures the Cognito Auth plugin using `amplify_outputs.dart`.
- **Initializes Global Providers**: It starts `UserProvider`, `MarketplaceProvider`, and `CartProvider` so they are available everywhere.
- **Configures Router**: It sets up `go_router` to handle navigation.
- **Splash Screen Logic**: The app starts at `/` (Splash). It waits for `UserProvider.isInitialized` to be true (which signifies that the backend profile fetch is complete) before allowing redirection to the main app screens.
- **Onboarding Guard**: Checks `userProvider.isOnboarded`. If the user is authenticated but not onboarded, it forces a redirect to `/onboarding`.

### `lib/screens/` (The Features)
This is where the visible parts of the app live. Each folder here is a distinct "part" of the app.
- **`common/`**: `splash_screen.dart` (The initial loading screen for the app).
- **`auth/`**: `login_screen.dart`, `register_screen.dart`, `onboarding_screen.dart` (Wizard for first-time user profile completion).
- **`marketplace/`**: `home_screen.dart` (Product Grid), `cart_screen.dart` (Checkout).
- **`profile/`**: `profile_screen.dart`.

### `lib/providers/` (State Management Deep Dive)
**"The Brain" of the Frontend.** These files hold the *data*.

#### **`UserProvider`** (`user_provider.dart`)
*Manages the current user's session and JIT status.*
- **Hub Listeners**: Monitors `Amplify.Hub` for sign-in/out events to reactively update state.
- **Key Methods**:
    - `checkAuthStatus()`: Runs on app start. Fetches backend profile via JIT if signed in.
    - `logout()`: Signs out from Amplify and resets the local user state.
- **Key Getters**: `isAuthenticated`, `isOnboarded`, `user`.

#### **`MarketplaceProvider`** (`marketplace_provider.dart`)
*Manages the list of items for sale.*
- **Variables**: `_products` (List of items), `_categories`.
- **Key Methods**:
    - `loadDemoData()`: *Currently a placeholder*. Fills the list with test data or empty lists. Needs to be connected to the real API.

#### **`CartProvider`** (`cart_provider.dart`)
*Manages the shopping cart.*
- **Variables**: `_items` (Map of Product ID -> Quantity).
- **Key Methods**:
    - `addItem(product)`: Adds 1 to quantity.
    - `removeItem(product)`: Removes from cart.
    - `totalAmount`: A "getter" that automatically calculates total price.

### `lib/services/` (Talking to the Backend)
**The Bridge.**
- **`auth_interceptor.dart`**: Automatically fetches the Cognito ID Token and attaches it to all outgoing `Dio` requests.
- **`api_service.dart`**: Sets up `Dio` (our HTTP client) with the base URL and the security interceptor.
- **`auth_service.dart`**:
    - `getProfile()`: Sends GET to `/api/v1/auth/me` (triggers JIT provisioning).
    - `onboardUser()`: Sends POST to `/api/v1/auth/onboard` to complete the user profile.

### `app/models/` (Data Structures)
These are simple definitions of our data in Dart.
- **`user_model.dart`**: Defines what a User looks like (`id`, `email`, `role`).
- **`product_model.dart`**: Defines what a Product looks like (`id`, `title`, `price`).

---

## ---

## 4. Core Design Patterns

Our mobile architecture leverages several industry-standard design patterns to ensure scalability and maintainability.

### 🔌 Interceptor Pattern (Network Security)
- **Implementation**: `lib/services/auth_interceptor.dart`
- **Rationale**: Decouples individual API calls from identity management. By intercepting every outgoing request, we ensure that authentication is a "cross-cutting concern" handled centrally.
- **Impact**: Developers never have to manually pass tokens to the `ApiService`.

### 📡 Observer Pattern (Auth Reactivity)
- **Implementation**: `UserProvider` + `Amplify.Hub.listen()`
- **Rationale**: Authentication state (sign-in, sign-out, timeout) can change at any time. The `UserProvider` reacts to these events immediately to update the UI.
- **Impact**: The UI remains in sync with the actual session state without manual polling.

### 🛡️ Guard Pattern (Navigation Control)
- **Implementation**: `lib/main.dart` -> `_createRouter` (GoRouter redirect)
- **Rationale**: Ensures business invariants (e.g., "Must be onboarded to see the marketplace") are enforced at the routing level.
- **Impact**: Provides a foolproof UX where users cannot skip required steps via deep links.
