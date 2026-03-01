# Phase 4 — Execution Plan
## Osomba Customer Care Forum + AI Help Board
**Author:** Yashu Gautamkumar Patel
**Status:** Implementation Phase — Hybrid Web/Mobile Approach
**Thesis Defense:** March 6, 2026

---

## HOW TO USE THIS PLAN

This document is the single source of truth for building the thesis.
- Complete every `[ ]` checkbox before moving to the next section.
- Never skip a section — each one builds on the previous.
- **The main Osomba codebase is forked into `osomba/` via `git subtree`.**
- We are using a **Hybrid App Approach (WebView)**. The backend is FastAPI, the frontend is React (Next.js/Vite), and the Flutter app simply embeds the React web app via an in-app browser.
- DB schema reference: `../Phase_1/02_Database_Schema.md`
- API spec reference: `../Phase_1/03_API_Endpoints.md`
- AI strategy reference: `../Phase_3/artifacts/01_AI_Strategy.md`

### BUILD PRIORITY (2-day timeline)

| Priority | What | Why |
|----------|------|-----|
| 🔴 P0 | Sections 1-6 (Backend + Seed Data) | The foundation of the application |
| 🔴 P0 | Section 7 (React Web App Integration) | **Thesis core** — The actual UI the user interacts with |
| 🟡 P1 | Section 8 (Flutter WebView Link) | Connecting the main app to the web UI |

---

## SECTION 1 — BACKEND SETUP (API & DATABASE)

### 1.1 Add thesis dependencies
- [x] Open `osomba/backend/requirements.txt` and append `pgvector`, `sentence-transformers`, `sendgrid`, `slowapi`, `bleach`.
- [x] Run `pip install -r requirements.txt`.

### 1.2 Configuration & Env Vars
- [x] Ensure `.env` is pointing to the correct AWS RDS endpoint.
- [x] Add thesis-specific env vars (`SENDGRID_API_KEY`, `EMBEDDING_MODEL`, etc.) to `.env`.
- [x] Update `app/core/config.py` to include these fields in the `Settings` class.

### 1.3 Database Setup
- [x] Enable `vector` and `pg_trgm` extensions on the PostgreSQL database.
- [x] Update `app/db/base.py` to import support models.
- [x] Update `app/main.py` to add CORS middleware, slowapi rate limiter, and a startup event for the AI model.

---

## SECTION 2 — DATABASE MODELS & SCHEMAS

### 2.1 Edit existing models
- [x] Edit `app/models/user.py` to add `email_notifications_enabled = Column(Boolean, default=True)`.
- [x] Update `UserRole` Enum to include `agent` and `customer` roles.

### 2.2 Create new Support Models
- [x] Create `app/models/support.py`.
- [x] Define `SupportCategory`, `ForumPost`, `OfficialAnswer`, `FaqArticle`, `ContentEmbedding`, and `AiQueryLog` tables.
- [x] Ensure `ContentEmbedding` has the `HNSW` vector index defined.

### 2.3 Alembic Migration
- [x] Generate Alembic migration: `alembic revision --autogenerate -m "add_support_tables"`.
- [x] Run `alembic upgrade head`.

### 2.4 Pydantic Schemas
- [x] Create `app/schemas/support.py` with all necessary request/response models (`ForumPostCreate`, `AiSuggestResponse`, etc.).

---

## SECTION 3 — CRUD LAYER

- [x] Create `app/crud/forum.py` (Create post, add official answer, update status).
- [x] Create `app/crud/faq.py` (Create article, convert from forum, track helpfulness).
- [x] Create `app/crud/ai_logs.py` (Log queries, track escalations, analytics).
- [x] Create `app/crud/category.py` (Manage support categories).

---

## SECTION 4 — SERVICES LAYER (The Brains)

### 4.1 Basic Services
- [ ] Create `app/services/forum_service.py` to handle business logic for forum interactions.
- [ ] Create `app/services/faq_service.py` to handle publishing and draft states.
- [ ] Create `app/services/email_service.py` using SendGrid to send notifications.

### 4.2 AI Service (AWS Bedrock + pgvector) - CRITICAL
- [ ] Create `app/services/ai_service.py`.
- [ ] Implement `boto3` client to connect to AWS Bedrock (`amazon.titan-embed-text-v2:0` or similar based on region availability).
- [ ] Write function to convert user text query into vector embedding.
- [ ] Write pgvector cosine similarity search function (`1 - (embedding <=> query_vec)`).

---

## SECTION 5 — API ENDPOINTS

- [ ] Update `app/api/dependencies.py` to use existing Cognito validation and add role guards (`require_agent`, `require_admin`).
- [x] Create `app/api/v1/endpoints/forum.py`.
- [x] Create `app/api/v1/endpoints/faq.py`.
- [ ] Create `app/api/v1/endpoints/ai.py` (Must connect to `ai_service.py`).
- [ ] Create `app/api/v1/endpoints/admin.py` and `categories.py`.
- [x] Wire all new routers into `app/api/v1/api.py`.

---

## SECTION 6 — SEED DATA

- [ ] Create `osomba/backend/scripts/seed_faqs.py`.
- [ ] Script must insert default categories (Payments, Listings, etc.).
- [ ] Script must read `Phase_3/artifacts/03_FAQ_Seeds.md`, generate embeddings via AWS Bedrock, and store them in `ContentEmbedding` table.
- [ ] Run the script to populate the live database.

---

## SECTION 7 — REACT WEB APP (The Frontend)

Instead of building native Flutter screens, we will use the React prototype as the actual production web app.

### 7.1 Setup
- [ ] Copy the contents of `Phase_2/UI-UX/Figma_code` into a new directory: `osomba/web-support/`.
- [ ] Install dependencies (`npm install axios aws-amplify @aws-amplify/ui-react`).
- [ ] Create a `.env` file pointing to the FastAPI backend (`VITE_API_URL=http://localhost:8000/api/v1`).

### 7.2 AWS Cognito Integration
- [ ] Configure `aws-exports.js` (or Amplify config) to use the exact same User Pool ID and Client ID as the Flutter app.
- [ ] Wrap the React app in an Amplify Authenticator (or use headless auth) so users share login states with the mobile app.

### 7.3 Data Wiring
- [ ] In `HomePage.tsx`, replace `mockQuestions` with an Axios `GET /forum/posts` call.
- [ ] In `AIHelpPage.tsx`, replace the mock timeout search with an Axios `POST /ai/suggest` call.
- [ ] In `FAQPage.tsx` and `ThreadDetailPage.tsx`, implement the "Was this helpful?" voting API calls.
- [ ] Ensure mobile responsiveness using Tailwind CSS (already mostly done in prototype).

---

## SECTION 8 — FLUTTER INTEGRATION (WebView Link)

This is the final step to connect the main app to your new thesis feature.

- [ ] In `osomba/mobile/pubspec.yaml`, add `url_launcher: ^6.2.0`.
- [ ] In `osomba/mobile/lib/screens/marketplace/home_screen.dart`, add a "Help & Support" button.
- [ ] In `osomba/mobile/lib/screens/profile/profile_screen.dart`, add a "Help & Support" ListTile.
- [ ] When clicked, use `launchUrl(Uri.parse('https://your-react-app-url.com'), mode: LaunchMode.inAppWebView)`.

---

## COMPLETION CHECKLIST

When all sections are done, verify these work end-to-end:
- [ ] User can log into the React web app using their existing Cognito credentials.
- [ ] User types query in AI board -> Backend calls Bedrock -> Backend searches pgvector -> React UI displays results.
- [ ] Flutter app successfully opens the React app in an internal browser window.
- [ ] Agent can log in, view open threads, write a reply, and it marks as answered.
