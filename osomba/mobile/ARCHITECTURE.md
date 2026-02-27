# Osomba - Mobile & Web Architecture Guide

## 1. Overview
This document outlines the **Feature-First Clean Architecture** adopted for the Osomba application. This structure supports scalable development across **iOS, Android, and Web** platforms using Flutter. It strictly separates concerns and mandates specific patterns for state management, navigation, and cloud identity.

## 2. Technology Stack & Packages
- **Framework**: Flutter (Mobile + Web)
- **Identity & Backend**: AWS Amplify Gen 2 (Cognito)
- **State Management**: `provider` (Flutter package)
  - A wrapper around InheritedWidget.
  - **CRITICAL RULE**: **Do NOT use `setState()`** for business logic. All state changes must be handled via Providers.
- **Navigation**: `go_router` (Flutter package)
  - Declarative routing with guard support for authentication and onboarding states.
- **Networking**: `dio` (Dart package)
  - Interceptor-based client for automated JWT injection.

## 3. Core Architectural Patterns

### 🔐 Secure Networking (AuthInterceptor)
We do not manually manage tokens in the UI or Providers.
- **Implementation**: `lib/services/auth_interceptor.dart`.
- **Workflow**: Before every request, the interceptor calls `Amplify.Auth.fetchAuthSession()`. It retrieves the latest valid ID Token and attaches it to the `Authorization` header.
- **Benefit**: Ensures zero-touch token refresh and prevents token leakage into UI logic.

### ⚡ Just-In-Time (JIT) Provisioning
The mobile app acts as the trigger for user record creation in the relational database.
- **Workflow**:
  1. User signs in via Amplify.
  2. `UserProvider` detects the sign-in via `Amplify.Hub`.
  3. The app calls `GET /auth/me` on our FastAPI backend.
  4. The backend verifies the JWT and automatically creates a skeleton user record in RDS if one doesn't exist.
- **Architecture**: Offloads identity management to Cognito while maintaining application-specific metadata in PostgreSQL.

### 🛡️ Navigation Guards & Initialization (Splash Screen)
The app uses a "Splash Screen Gatekeeper" pattern to resolve race conditions between identity (Cognito) and backend profile (RDS) state.
- **Initial Location**: `/` (Splash Screen).
- **Initialization Logic**: `GoRouter` remains on the Splash screen until `UserProvider.isInitialized` is true.
- **Redirection**: Once initialized:
  - Unauthenticated -> `/marketplace` (Authenticator handles login).
  - Authenticated && !Onboarded -> `/onboarding`.
  - Authenticated && Onboarded -> `/marketplace`.
- **Benefit**: Eliminates UI flicker where the home page was briefly visible before the profile fetch completed.

## 4. Directory Structure
The project follows a **Feature-First** organization. Code is grouped by **what it does** (Feature), not **what it is** (Screen/Widget).

```
lib/
├── main.dart                   # Entry point, Hub listeners & Global Router
├── amplify_outputs.dart        # Auto-generated Cloud configuration
├── models/                     # Shared DTOs (e.g., UserModel)
├── providers/                  # Global State (UserProvider)
├── services/                   # Networking (ApiService, AuthInterceptor)
└── screens/                    # FEATURE MODULES
    ├── common/                 # Global UI (SplashScreen)
    ├── auth/                   # Authentication (Authenticator, OnboardingScreen)
    ├── marketplace/            # Core Shopping (ProductProvider, Home)
    └── profile/                # Account settings
```

## 5. Development Rules

### 1. No `setState()` Policy
Logic belongs in `providers/`. UI belongs in `StatelessWidget`. Use `Consumer` or `context.watch<T>()` to bridge them.

### 2. Feature Isolation
Resources only used by one feature (e.g., a `ProductCard`) belong in that feature's directory (`screens/marketplace/widgets/`), not the global folder.

### 3. Networking
Direct HTTP calls in UI are **forbidden**. All calls go through `AuthService` which uses the configured `Dio` instance with the `AuthInterceptor`.
