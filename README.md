# Osomba: Global Africa Marketplace

## Project Overview
Osomba is a multi-category digital marketplace designed to connect buyers and sellers across Africa with the global market. The platform focuses on localized features like MPESA payment integration, proxy bidding auctions, and a verified seller network.

## Architecture

The project consists of three main components:

- **Mobile App (`/mobile`)**: A Flutter-based cross-platform application (iOS/Android) built with a **Feature-First Clean Architecture**. It uses the Provider pattern for state management and strictly adheres to stateless widgets for UI logic.
- **Backend API (`/backend`)**: A high-performance REST API built with **FastAPI (Python)**. It handles authentication, product management, complex auction bidding mathematics, and secure order processing.
- **Database**: PostgreSQL hosted on AWS RDS.

## 🧪 Testing
We maintain high test coverage for both frontend and backend. For detailed instructions on running tests and generating coverage reports, see **[docs/guides/testing.md](docs/guides/testing.md)**.

## Quick Start

### 1. Backend Setup
Navigate to the backend directory and follow the instructions in [backend/README.md](backend/README.md).
```bash
cd backend
# Create env, install requirements, and run server
```

### 2. Mobile App Setup
Navigate to the mobile directory and follow the instructions in [mobile/README.md](mobile/README.md).
```bash
cd mobile
# Install dependencies and run flutter
```

## Cloud Infrastructure
The project is hosted on AWS:
- **API**: AWS Elastic Beanstalk
- **Database**: AWS RDS (PostgreSQL)
- **Media**: AWS S3 (planned)
- **Authentication**: AWS Cognito (managed via Amplify)

For detailed deployment instructions, see the internal `docs/architecture/infrastructure.md` documentation.
