# Phase 4 — Execution Plan
## Somba Marketplace: Unified Support Forum & AI Help Board
**Author:** Yashu Gautamkumar Patel
**Status:** Implementation Phase — Isolated Web App Approach
**Thesis Defense:** March 6, 2026

---

## 1. PROJECT ALIGNMENT & SCOPE

This execution plan directly fulfills the commitments made in the **Barrett Thesis Prospectus**.

The thesis is an **independent, student-owned subsystem** that will be built as a standalone responsive web application (`Phase_05/frontend`) and a standalone API backend (`Phase_05/backend`). It will later be linked into the main Capstone Flutter app via a WebView, but the Flutter integration itself is *not* part of the core thesis grading criteria.

### Thesis Deliverables Satisfied by this Plan:
*   **Customer Care Forum + FAQ (MVP)**
    *   [x] Unified search bar (FAQ + Forum)
    *   [x] Post question flow (with category selection)
    *   [x] Official Answer feature (Agent locks/closes threads)
    *   [x] Convert Official Answer to FAQ (Agent capability)
    *   [x] User Roles (Customer, Agent, Admin)
    *   [x] Language Scaffolding (EN/FR tag tracking)
*   **AI Help Board**
    *   [x] AWS Bedrock text embeddings + pgvector database search
    *   [x] Ranked suggestions strictly from approved internal content
    *   [x] Pre-filled forum escalation if no AI match is found
    *   [x] Telemetry/logging for Admin Analytics (Deflection rates, Top queries)

### User Flows Satisfied (`Phase_2/User_flow/mmd_files/`):
*   `customer_flow.mmd`: Searching, posting questions, viewing answers.
*   `agent_flow.mmd`: Filtering open threads, replying with official answers, converting to FAQ.
*   `admin_flow.mmd`: Viewing KPI dashboard, managing categories, promoting users.
*   `ai_flow.mmd`: Querying -> Bedrock Embedding -> pgvector similarity check -> Output or Escalate.

---

## 2. REVISED ARCHITECTURE

**Backend (`Phase_05/backend`):** FastAPI + PostgreSQL (`pgvector`) + AWS Bedrock.
**Frontend (`Phase_05/frontend`):** React (Next.js/Vite) with Tailwind CSS. (Sourced from `Phase_2/UI-UX/Figma_code`).
**Deployment/Integration:** The React app is fully responsive. The Capstone team will add a simple link in the Flutter app that opens this web app in an in-app browser.

---

## 3. EXECUTION STEPS

### STEP 1: Backend Isolation & Setup (Complete)
- [x] Create `Phase_05` directory.
- [x] Copy FastAPI backend codebase, isolating it completely from the main team repository (no `.git` conflicts).
- [x] Integrate `pgvector`, `sentence-transformers`, `sendgrid`, `slowapi`.
- [x] Define `SupportCategory`, `ForumPost`, `OfficialAnswer`, `FaqArticle`, `ContentEmbedding`, and `AiQueryLog` models.
- [x] Run Alembic migrations to build tables in PostgreSQL.

### STEP 2: Core AI Implementation (Complete)
- [x] Implement `app/services/ai_service.py` using `boto3`.
- [x] Connect to AWS Bedrock (`amazon.titan-embed-text-v2:0`) to generate 384-dimensional embeddings.
- [x] Write SQL `pgvector` queries utilizing the `<=>` cosine distance operator for fast similarity matching.
- [x] Build `/api/v1/ai/suggest` endpoint.

### STEP 3: Frontend Web Setup (Pending)
- [ ] Copy the beautiful React/Tailwind codebase from `Phase_2/UI-UX/Figma_code` into `Phase_05/frontend`.
- [ ] Initialize as a clean Git repository if necessary, or just manage inside the thesis folder.
- [ ] Install required web dependencies (`axios`, `lucide-react`, `recharts` for admin dashboard).
- [ ] Configure `.env` to point to the local FastAPI backend (`VITE_API_URL=http://localhost:8000/api/v1`).

### STEP 4: Wiring Frontend to Backend (Pending)
Currently, the React app uses hardcoded mock data. We must replace this with real API calls:

*   **Customer Features:**
    *   [ ] `HomePage.tsx`: Fetch recent forum posts (`GET /forum/posts`).
    *   [ ] `AIHelpPage.tsx`: Fetch semantic matches (`POST /ai/suggest`).
    *   [ ] `PostQuestionPage.tsx`: Submit new post (`POST /forum/posts`).
    *   [ ] `FAQPage.tsx` & `ThreadDetailPage.tsx`: Implement "Was this helpful?" voting API.

*   **Agent Features:**
    *   [ ] `AgentDashboardPage.tsx`: Fetch open/unanswered threads.
    *   [ ] Thread View: Submit "Official Answer" (`POST /forum/posts/{id}/answer`).
    *   [ ] Thread View: "Bookmark as FAQ" (`POST /faq/convert-from-forum`).

*   **Admin Features:**
    *   [ ] `AnalyticsDashboardPage.tsx`: Fetch telemetry data from `AiQueryLog` table (Deflection rates, etc.).
    *   [ ] Category Management: `POST /categories` and `PUT /categories`.
    *   [ ] Agent Management: Promote users to 'agent' role.

### STEP 5: Seed Data Generation (Pending)
- [ ] Create `Phase_05/backend/scripts/seed_database.py`.
- [ ] Read the 20 FAQ articles from `Phase_3/artifacts/03_FAQ_Seeds.md`.
- [ ] For each FAQ, call AWS Bedrock to generate an embedding.
- [ ] Insert the text and the vector into the `faq_articles` and `content_embeddings` tables so the AI has data to search against.

### STEP 6: Thesis Defense Preparation (Pending)
- [ ] Ensure the web app is completely styled and responsive.
- [ ] Record a video demo running through the 4 User Flows (Customer, AI, Agent, Admin).
- [ ] Draft final thesis document explaining the AWS Bedrock + `pgvector` architecture.

---

## 4. FUTURE CAPSTONE INTEGRATION (Out of Scope for Grading)
To integrate this into the main Somba mobile app later, the Capstone team will:
1.  Ensure AWS Cognito is shared between the Flutter App and this React App.
2.  Add a `url_launcher` button in the Flutter app pointing to the hosted URL of this React app.
3.  The React app will seamlessly handle all support forum needs via mobile WebView.
