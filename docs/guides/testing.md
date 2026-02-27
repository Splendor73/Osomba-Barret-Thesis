# Osomba Marketplace Testing Guide

This document provides instructions for running tests and generating coverage reports for both the Backend (Python) and Mobile (Flutter) applications.

---

## 🐍 Backend Testing (FastAPI)

We use `pytest` for unit and integration testing.

### 1. Prerequisites
Ensure you have installed the development dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run All Tests
To run the full test suite:
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest
```

### 3. Run Specific Tests
```bash
PYTHONPATH=. ./venv/bin/pytest tests/test_jit.py
```

### 4. Coverage Report
To generate a coverage report in the terminal:
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest --cov=app tests/
```

To generate an HTML coverage report (found in `backend/htmlcov/index.html`):
```bash
PYTHONPATH=. ./venv/bin/pytest --cov=app --cov-report=html tests/
```

---

## 📱 Mobile Testing (Flutter)

We use the built-in `flutter test` framework for unit and widget testing.

### 1. Prerequisites
Ensure you have fetched the dependencies:
```bash
cd mobile
flutter pub get
```

### 2. Run All Tests
To run all tests in the `test/` directory:
```bash
cd mobile
flutter test
```

### 3. Run Specific Tests
```bash
flutter test test/user_model_test.dart
```

### 4. Coverage Report
To generate coverage data (LCOV format):
```bash
cd mobile
flutter test --coverage
```

To view the coverage report as HTML (requires `lcov` installed on your system):
```bash
# Generate HTML from LCOV
genhtml coverage/lcov.info -o coverage/html
# Open the report
open coverage/html/index.html
```

---

## 🛠 Project Testing Strategy

1. **Backend**:
   - **Integrity Tests**: Verify database schema and core models.
   - **JIT Tests**: Ensure Just-In-Time provisioning logic works atomically.
   - **Security Tests**: Verify RSA token validation and JWKS caching.
2. **Mobile**:
   - **Model Tests**: Verify JSON serialization/deserialization for API entities.
   - **Service Tests**: Verify `AuthInterceptor` and networking logic via mocking.
   - **Provider Tests**: Verify global state transitions and reactive logic.

---

## 🧪 Manual E2E Testing Checklist

Use this checklist to verify the integrated authentication and onboarding flow.

### 1. Branded Sign Up & Verification
- [ ] **Launch App**: `flutter run`.
- [ ] **Sign Up**: Navigate to "Create Account", enter a unique test email and password.
- [ ] **Email Verification**: Check for branded email (Subject: "Welcome to Osomba!").
- [ ] **Confirm Code**: Enter the code. App should sign you in and move to Onboarding.

### 2. JIT Provisioning & Database Verification
- [ ] **Sign In**: Complete Step 1.
- [ ] **Check DB**: Run `SELECT * FROM users WHERE email = '<test-email>';` via SSH tunnel.
- [ ] **Verify**: Row should exist with `is_onboarded = false` and correct `cognito_sub`.

### 3. Branded Password Reset
- [ ] **Initiate**: Click "Forgot your password?" on Sign In screen.
- [ ] **Email**: Verify branded reset email (Subject: "Reset your Osomba password").
- [ ] **Complete**: Enter code and new password. Verify login works.

### 4. Session Persistence
- [ ] **Hard Restart**: Sign in, kill the app process, and relaunch.
- [ ] **Result**: App should bypass login and show the home/onboarding screen immediately.
