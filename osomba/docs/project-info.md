# Osomba Marketplace: Project Information & Documentation Index

Welcome to the Osomba Marketplace project. This document serves as the central entry point for understanding the project goals and navigating our technical documentation.

---

## 1. Project Overview

**Osomba** is a multi-category digital marketplace designed to connect buyers and sellers across Africa with the global market.

- **Goal**: Provide a seamless trading platform with localized payment integrations (M-Pesa), fair auction mechanics (proxy bidding), and a verified seller network.
- **Tech Stack**:
    - **Frontend**: Flutter (iOS/Android/Web)
    - **Backend**: FastAPI (Python 3.12)
    - **Database**: PostgreSQL (AWS RDS)
    - **Deployment**: AWS Elastic Beanstalk (API) and AWS S3 (Media)

---

## 2. Project Status (Sprint 7 Roadmap)

| Feature | Backend | Mobile | Status |
|---------|---------|--------|--------|
| User Authentication | ✅ | ✅ | Cognito + JIT Ready |
| User Onboarding | ✅ | ✅ | Complete |
| Product Listings | ✅ | ✅ | Complete |
| Shopping Cart | ✅ | ✅ | Complete |
| Auctions & Bidding | ✅ | 🔄 | Logic Integrated |
| Order Processing | ✅ | 🔄 | Backend Ready |
| Messaging | 🔄 | 🔄 | In Progress |
| Notifications | 🔄 | 🔄 | In Progress |
| Payment (M-Pesa) | 📋 | 📋 | Planned |
| Reviews & Ratings | 🔄 | 🔄 | In Progress |

**Legend:** ✅ Complete | 🔄 In Progress | 📋 Planned

---

## 3. Documentation Index

### 🏁 Getting Started
- **[Developer Setup Guide](guides/setup.md)**: Environment setup, AWS credentials, and initial DB connectivity.
- **[Development Workflow](guides/workflow.md)**: Daily routines, deployment commands, and log debugging.
- **[Testing Guide](guides/testing.md)**: Instructions for running backend (pytest) and mobile (flutter test) suites.

### 🏗️ Architecture & Deep Dives
- **[Backend Architecture](architecture/backend.md)**: Master plan for MVC, Dependency Injection, and the 4-layer data flow.
- **[Mobile Architecture](architecture/mobile.md)**: Flutter codebase structure and state management (Provider).
- **[Infrastructure & AWS](architecture/infrastructure.md)**: VPC details, Security Groups, and RDS/EC2 registry.
- **[Feature Traces](architecture/feature-traces.md)**: High-level walkthrough of how data flows from UI to Database.
- **[Database/Alembic](guides/database.md)**: Managing schema versions and migrations.

### 🛠️ Maintenance & Utilities
- **[User Cleanup Utility](maintenance/testing-cleanup.md)**: Resetting test accounts in Cognito and RDS.
- **[Scrubbing Secrets](maintenance/scrubbing-secrets.md)**: Removing sensitive data from Git history.
- **[Lint Remediation](maintenance/lint-remediation.md)**: Current code quality status and maintenance plan.

---

**Last Updated:** February 2026
