# Phase 4 — Execution Plan
## Osomba Customer Care Forum + AI Help Board
**Author:** Yashu Gautamkumar Patel
**Status:** Implementation Phase — code lives in `osomba/` (forked from main team repo)
**Thesis Defense:** March 6, 2026

---

## HOW TO USE THIS PLAN

This document is the single source of truth for building the thesis.
- Complete every `[ ]` checkbox before moving to the next section.
- Never skip a section — each one builds on the previous.
- **The main Osomba codebase is forked into `osomba/` via `git subtree`. All thesis code is added there.**
- We are using the **Live AWS RDS Database** and the **Live AWS Cognito** for authentication to minimize merge conflicts with the main team repo.
- DB schema reference: `../Phase_1/02_Database_Schema.md`
- API spec reference: `../Phase_1/03_API_Endpoints.md`
- AI strategy reference: `../Phase_3/artifacts/01_AI_Strategy.md`
- FAQ seed data: `../Phase_3/artifacts/03_FAQ_Seeds.md`
- Figma UI reference: `../Phase_2/UI-UX/Figma_code/` (design reference only)

### BUILD PRIORITY (2-day timeline)

| Priority | What | Why |
|----------|------|-----|
| 🔴 P0 | Sections 0–8 (Backend + seed data) | Everything else depends on this |
| 🔴 P0 | Flutter: forum + AI board screens | **Thesis core** — customer asks, AI answers or escalates |
| 🟡 P1 | Flutter: FAQ screens + agent dashboard | Agent → FAQ pipeline demo |
| 🟢 P2 | Flutter: admin screens | Nice to have — demo via Swagger if time runs out |

**If time is short: working backend + Flutter with AI board + forum = complete thesis demo.**

---

## SECTION 0 — GIT: FORK MAIN REPO INTO THESIS REPO

### 0.1 One-time setup

```
Main team repo:  https://github.com/hestonhamilton/osomba.git
Thesis repo:     https://github.com/Splendor73/Osomba-Barret-Thesis.git
```

- [x] `upstream` remote already added.
- [x] Old partial `Phase_5/` directory removed.
- [x] Forked the ENTIRE main Osomba repo into `osomba/` via `git subtree`.

### 0.2 What we add vs what already exists

The main backend already has: users, products, auctions, orders, payments, messages, notifications, reviews.
We add thesis-specific code on top — **no changes to existing auth flow. We rely entirely on Cognito.**

| File | EDIT or NEW | What |
|------|-------------|------|
| `osomba/backend/app/models/user.py` | **EDIT** | Add `email_notifications_enabled` thesis field |
| `osomba/backend/app/core/config.py` | **EDIT** | Add thesis settings (SendGrid, AI thresholds) |
| `osomba/backend/app/db/base.py` | **EDIT** | Add support model import |
| `osomba/backend/app/main.py` | **EDIT** | Add CORS + slowapi middleware |
| `osomba/backend/app/api/v1/api.py` | **EDIT** | Add thesis routers |
| `osomba/backend/requirements.txt` | **EDIT** | Add thesis packages (pgvector, sentence-transformers, etc.) |
| `osomba/backend/app/models/support.py` | **NEW** | 6 thesis tables |
| `osomba/backend/app/schemas/support.py` | **NEW** | All thesis Pydantic schemas |
| `osomba/backend/app/crud/` | **NEW** | CRUD files (forum.py, faq.py, ai_logs.py, category.py) |
| `osomba/backend/app/services/` | **NEW** | Service files (forum_service, ai_service, email_service) |
| `osomba/backend/app/api/v1/endpoints/` | **NEW** | Endpoint files (forum, faq, search, ai, admin) |
| `osomba/backend/app/api/dependencies.py` | **EDIT** | Add role checks using existing Cognito validation |
| `osomba/backend/scripts/seed_faqs.py` | **NEW** | Seed script |
| `osomba/backend/alembic/versions/` | **NEW** | 1 migration |
| `osomba/mobile/lib/main.dart` | **EDIT** | Add thesis routes to GoRouter |
| `osomba/mobile/lib/services/api_service.dart` | **EDIT** | Add thesis API methods |
| `osomba/mobile/lib/providers/user_provider.dart` | **EDIT** | Expose role getters based on UserRole enum |
| `osomba/mobile/lib/screens/support/` | **NEW** | 9 customer + agent screens |
| `osomba/mobile/lib/screens/admin/` | **NEW** | 5 admin screens |
| `osomba/mobile/pubspec.yaml` | **EDIT** | Add fl_chart |

---

## SECTION 1 — BACKEND SETUP

### 1.1 Add thesis dependencies

- [ ] Open `osomba/backend/requirements.txt` and append these packages:
  ```
  # --- Thesis additions ---
  pgvector==0.3.5
  sentence-transformers==3.3.1
  sendgrid==6.11.0
  slowapi==0.1.9
  bleach==6.1.0
  ```
- [ ] In `osomba/backend/`, activate venv and run `pip install -r requirements.txt`.

### 1.2 Add thesis env vars

- [ ] Ensure `.env` is pointing to the correct AWS RDS endpoint (usually via localhost:5433 SSH tunnel).
- [ ] Append these to `osomba/backend/.env`:
  ```
  # --- Thesis additions ---
  SENDGRID_API_KEY=SG.xxxxxxxx
  FROM_EMAIL=support@osomba.com
  FRONTEND_URL=http://localhost:8000
  EMBEDDING_MODEL=all-MiniLM-L6-v2
  SIMILARITY_THRESHOLD=0.6
  CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001
  ```

### 1.3 Enable pgvector extension (One time on RDS)

- [ ] Run this SQL against the live AWS RDS Database:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  ```

### 1.4 Edit `osomba/backend/app/core/config.py`

- [ ] Add these thesis fields to the existing `Settings` class:
  ```python
  sendgrid_api_key: str = Field(default="", alias="SENDGRID_API_KEY")
  from_email: str = Field(default="support@osomba.com", alias="FROM_EMAIL")
  frontend_url: str = Field(default="http://localhost:8000", alias="FRONTEND_URL")
  embedding_model: str = Field(default="all-MiniLM-L6-v2", alias="EMBEDDING_MODEL")
  similarity_threshold: float = Field(default=0.6, alias="SIMILARITY_THRESHOLD")
  cors_origins: str = Field(
      default="http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001",
      alias="CORS_ORIGINS"
  )
  ```

### 1.5 Edit `osomba/backend/app/db/base.py`

- [ ] Add the support model import so Alembic sees the thesis tables:
  ```python
  from app.models import support  # noqa — thesis support tables
  ```

### 1.6 Edit `osomba/backend/app/main.py`

- [ ] Add CORS middleware reading from settings.
- [ ] Add slowapi rate limiter middleware.
- [ ] Add startup event to warm up the embedding model.

---

## SECTION 2 — DATABASE MODELS

### 2.1 Edit `osomba/backend/app/models/user.py`

- [ ] Add `agent` and `customer` to `UserRole` Enum if not already there.
- [ ] Add this field to the `User` class (no custom passwords needed, Cognito handles auth):
  ```python
  email_notifications_enabled = Column(Boolean, default=True)
  ```

### 2.2 Create `osomba/backend/app/models/support.py`

- [ ] Create `SupportCategory`, `ForumPost`, `OfficialAnswer`, `FaqArticle`, `ContentEmbedding`, and `AiQueryLog`. (No `UserSession` needed).
- [ ] Set up foreign keys pointing to `users.user_id` appropriately.
- [ ] Include HNSW index on `ContentEmbedding`.

### 2.3 Alembic Migration

- [ ] Generate migration: `alembic revision --autogenerate -m "add_support_tables"`
- [ ] Ensure `op.execute("CREATE EXTENSION IF NOT EXISTS vector")` is at the top of the `upgrade()` function.
- [ ] Upgrade the live database using your active SSH tunnel connection.

---

## SECTION 3 — PYDANTIC SCHEMAS

- [ ] Create `osomba/backend/app/schemas/support.py`.
- [ ] Do **not** create auth schemas. Focus entirely on `CategoryOut`, `ForumPostCreate`, `ForumPostOut`, `FaqArticleCreate`, `AiSuggestResponse`, etc.

---

## SECTION 4 — CRUD LAYER

- [ ] Create `forum.py`, `faq.py`, `ai_logs.py`, `category.py` in `app/crud/`.

---

## SECTION 5 — SERVICES LAYER

- [ ] Create `forum_service.py`, `faq_service.py`, `search_service.py`, `ai_service.py`, and `email_service.py` to handle business logic and embeddings.

---

## SECTION 6 — API ENDPOINTS

- [ ] In `app/api/dependencies.py`, leverage the existing `get_current_user` method that relies on Cognito. Add `require_agent` and `require_admin` role-checking wrappers.
- [ ] Create API routes in `app/api/v1/endpoints/`: `forum.py`, `faq.py`, `search.py`, `ai.py`, `categories.py`, `admin.py`.
- [ ] Connect them to `app/api/v1/api.py`.

---

## SECTION 7 — SEED DATA

- [ ] Update seed script to generate embeddings for seeded FAQs and insert categories. Note: Seed script must not rely on custom password hashing since we use Cognito.

---

## SECTION 8 — FLUTTER APP (UI Integration)

- [ ] Keep `auth_service.dart` completely standard. Cognito remains untouched.
- [ ] Inside `user_provider.dart`, use the user role from the database response to map properties like `isAgent` and `isAdmin`.
- [ ] Create screens in `lib/screens/support/` and `lib/screens/admin/`.
- [ ] Integrate into GoRouter.

---

## SECTION 9 — TESTING & VERIFICATION

- [ ] Ensure API routes hit standard authentication constraints via Cognito.
- [ ] Test AI suggestions.
- [ ] Test the Agent flow natively in Flutter.
