# Osomba Mobile App

## 📱 Project Overview
The mobile application for the Osomba marketplace, built using **Flutter**. It follows a **Feature-First Clean Architecture** and utilizes **AWS Cognito** for secure identity management and **GoRouter** for declarative navigation.

## 🏗 Architecture
The app is organized by feature modules (Auth, Marketplace, Profile) and uses **Provider** for global state management.

## 🚀 Getting Started

### 1. Prerequisites
- **Flutter SDK** (^3.9.2) - [Install Guide](https://docs.flutter.dev/get-started/install)
- **Node.js** (v18+) - Required for Amplify CLI tools.
- **AWS Profile** - Configured with credentials for the `osomba-amplify-dev` profile.

### 2. Initial Setup
Inside the `mobile/` directory, install dependencies:
```bash
# Flutter dependencies
flutter pub get

# Amplify infrastructure tools
npm install
```

### 3. AWS Backend Sync
Sync your local environment with the Amplify sandbox to generate `amplify_outputs.dart`:
```bash
npx ampx sandbox --profile osomba-amplify-dev
```

### 4. Running the App
Ensure your local backend (FastAPI) is running if you are testing JIT provisioning, then:
```bash
flutter run
```

## 🛠 Features Implemented (Latest)
- **Start Screen:** Branded onboarding with feature highlights.
- **Custom Login UI:** High-fidelity implementation of the orange-themed login page.
- **Amplify Integration:** Seamless authentication flow using Cognito.
- **Onboarding Guard:** Automatic redirection for users with incomplete profiles.

## 🧪 Testing
Run unit and widget tests:
```bash
flutter test
```

## 🎨 Branding
For a quick reference of hex codes and asset usage, see:
`lib/theme/brand_colors.txt`
