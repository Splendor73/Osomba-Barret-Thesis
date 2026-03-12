# Phase 4 — Final Execution Plan
## Osomba Marketplace: Unified Support Forum & AI Help Board
**Author:** Yashu Gautamkumar Patel
**Status:** ✅ COMPLETE — All Steps Executed, App Fully Working
**Thesis Defense:** March 6, 2026
**Last Updated:** March 2, 2026

---

## 0. PLANNING FOUNDATION — HOW PHASES 1–3 FED INTO THIS PLAN

Phases 1 through 3 were completed in the fall semester. Each phase produced concrete artifacts that directly shaped this execution plan. Nothing in Phase 4 was invented from scratch — every decision below traces back to a prior phase.

### Phase_01 — Requirements & Architecture
**Artifacts:** `Phase_01/01_System_Architecture.md`, `Phase_01/02_Database_Schema.md`, `Phase_01/03_API_Endpoints.md`, `Phase_01/04_Requirements_Document.md`, `Phase_01/Report_1.md`

| Artifact | What it defined | Where it landed in Phase 5 |
|---|---|---|
| Requirements Document | Three user roles (Customer, Agent, Admin), six support categories (Payments, Listings, Safety, Disputes, Account, Delivery), scope boundaries (no live chat, no video tutorials) | `app/models/support.py` — ForumCategory seeded with those exact six categories; role middleware in `app/api/dependencies.py` |
| Database Schema | Five core tables: `forum_categories`, `forum_topics`, `forum_posts`, `faqs`, `ai_query_logs`; 384-dim vector embedding columns on topics and FAQs | `app/models/support.py` — exact schema as designed; pgvector extension on Amazon RDS |
| API Endpoints | Full route map: `/forum`, `/faq`, `/ai`, `/search`, `/admin`, `/categories` | `app/api/v1/endpoints/` — one file per route group, matching Phase_01 spec |
| System Architecture | Four-layer pattern: Endpoints → Services → CRUD → Models | Maintained throughout `Phase_05/backend/` directory structure |

### Phase_02 — UI/UX Design & User Flows
**Artifacts:** `Phase_02/UI-UX/Barret_theses_2.0/` (Osomba 2.0 theme), `Phase_02/User_flow/mmd_files/` (four flow diagrams), `Phase_02/Report_2.md`

| Artifact | What it defined | Where it landed in Phase 5 |
|---|---|---|
| Figma / Barret_theses_2.0 components | Osomba brand colors (orange #F67C01, green #46BB39), OrganicBackground SVG shapes, redesigned Header, Sidebar, all 9 page layouts | Copied directly into `Phase_05/frontend/src/` as the starting point for Step 1 |
| `customer_flow.mmd` | Login → Search → Post Question → View Thread → FAQ voting | Wired in Steps 4 and 5 of this plan |
| `agent_flow.mmd` | Agent Dashboard → Open Thread → Official Answer → Lock → Convert to FAQ | Wired in Step 6 of this plan |
| `admin_flow.mmd` | Analytics Dashboard → Category Management → User Role Management | Wired in Step 7 of this plan |
| `ai_flow.mmd` | Query → Embedding → Ranked Results → Escalate to Forum | Wired in Step 5 of this plan; AiQueryLog logs every step |

### Phase_03 — Research & Technology Decisions
**Artifacts:** `Phase_03/artifacts/01_AI_Strategy.md`, `Phase_03/artifacts/02_Auth_Flow.md`, `Phase_03/artifacts/03_FAQ_Seeds.md`, `Phase_03/artifacts/04_Tech_Stack.md`, `Phase_03/Report_3.md`

| Artifact | Decision made | Why | Where it landed in Phase 5 |
|---|---|---|---|
| AI Strategy | Use RAG retrieval only — no generative answers | Real money transactions require accurate information; chatbots hallucinate | `app/services/ai_service.py` — searches existing FAQs and forum topics, never generates new content |
| AI Strategy | AWS Bedrock Titan Embed Text v2 (384-dim) over local sentence-transformers | No model to host, API call instead, works in production | `ai_service.generate_embedding()` calls Bedrock; pgvector stores 384-dim vectors |
| AI Strategy | Amazon Nova Micro for EN/FR translation | On-demand only (not pre-translated), low latency, stays within AWS | `ai_service.translate_text()` called per request when `lang=fr` is passed |
| Auth Flow | AWS Cognito with Just-In-Time (JIT) provisioning | First login auto-creates user record — no manual setup per user | `app/services/auth_service.py` — Cognito JWT → lookup by SUB → create if missing |
| Auth Flow | Roles stored in Cognito groups (`customer`, `agent`, `admin`) | Single source of truth; role change in DB also updates Cognito | `PUT /admin/users/{id}/role` updates both DB and Cognito |
| FAQ Seeds | 20 pre-written FAQ entries across all six categories | Seed data so AI search works from day one of the demo | `Phase_05/backend/scripts/seed_faqs.py` — seeded with real Bedrock embeddings |
| Tech Stack | AWS SES for email (switched from SendGrid) | Keeps all infrastructure within AWS, one account, one set of keys | `app/services/email_service.py` — SES sends notification on official answer |

---

## 1. PROJECT ALIGNMENT & SCOPE

This execution plan directly fulfills **every commitment** made in the **Barrett Thesis Prospectus**. Each deliverable is mapped to a concrete implementation step below.

This is an **independent, student-owned subsystem** — a standalone responsive web application (`Phase_05/frontend`) with a standalone API backend (`Phase_05/backend`). Flutter/mobile integration is **out of scope** for thesis grading.

### Prospectus Deliverable Mapping

| Prospectus Deliverable | Execution Step | Status |
|---|---|---|
| **1a.** Unified search bar (FAQ + Forum) | Step 4.1 (SearchBar), Step 5 (search endpoint) | ✅ Complete |
| **1b.** Post question flow (category selection) | Step 4.3 (PostQuestionPage), Step 5 (forum endpoints) | ✅ Complete |
| **1c.** Official Answer (agent locks/closes threads) | Step 6 (agent endpoints + UI) | ✅ Complete |
| **1d.** Agent bookmark → FAQ conversion | Step 6 (convert-to-faq endpoint + UI) | ✅ Complete |
| **1e.** Roles & Access (Customer, Agent, Admin) | Step 3 (Cognito + middleware) | ✅ Complete |
| **1f.** Language scaffolding (EN/FR) | Step 9 (i18n setup) | ✅ Complete |
| **2a.** AI ranked suggestions (titles + previews) | Step 5 (AI suggest endpoint) | ✅ Complete |
| **2b.** Pre-filled forum escalation from AI | Step 5 (AIHelpPage → PostQuestionPage) | ✅ Complete |
| **2c.** Telemetry/logging for analytics | Step 7 (AiQueryLog + admin dashboard) | ✅ Complete |

### User Flows Covered (`Phase_02/User_flow/mmd_files/`)

| Flow | File | Covered By |
|---|---|---|
| Customer | `customer_flow.mmd` | Steps 4, 5 |
| Agent | `agent_flow.mmd` | Step 6 |
| Admin | `admin_flow.mmd` | Step 7 |
| AI | `ai_flow.mmd` | Step 5 |

---

## 2. ARCHITECTURE

```
┌──────────────────────────────────────────────────┐
│              FRONTEND (Phase_05/frontend)         │
│  React + Vite + TypeScript + Tailwind + shadcn/ui │
│  Pages: Home, FAQ, AI Help, Post Question,        │
│         Thread Detail, Agent Dashboard, Analytics, │
│         User Management, Category Management       │
│  Theme: Osomba (orange #F67C01 / green #46BB39)   │
│  OrganicBackground SVG shapes + gradient branding  │
│  Deployed on: AWS Amplify (or localhost for demo)  │
└──────────────────────────────────────────────────┘
                        ↓ REST API (axios)
┌──────────────────────────────────────────────────┐
│              BACKEND (Phase_05/backend)            │
│  FastAPI + SQLAlchemy + Alembic                    │
│  Auth: AWS Cognito JWT verification                │
│  Endpoints: /forum, /faq, /ai, /search, /admin,   │
│             /categories, /users, /auth             │
└──────────────────────────────────────────────────┘
                        ↓ SQL + pgvector
┌──────────────────────────────────────────────────┐
│         SHARED DATABASE (same RDS instance)        │
│  PostgreSQL 15+ with pgvector extension            │
│                                                    │
│  Capstone tables (read-only by thesis):            │
│    users, orders, order_items, payment, products   │
│                                                    │
│  Thesis tables (owned by this app):                │
│    forum_categories, forum_topics, forum_posts,    │
│    faqs, ai_query_logs                             │
│                                                    │
│  Shared FK: forum_topics.user_id → users.user_id  │
│  Shared FK: orders.buyer_id → users.user_id        │
└──────────────────────────────────────────────────┘
                        ↓ API calls
┌──────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                     │
│  • AWS Bedrock (Titan Embed v2 — embeddings)       │
│  • AWS Bedrock Nova Micro (translations — EN/FR)   │
│  • AWS Cognito (auth + roles)                      │
│  • AWS SES (email notifications)                   │
└──────────────────────────────────────────────────┘
```

### Tech Stack (Final)

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui + Osomba Theme (orange #F67C01 / green #46BB39) |
| State | React Context + Hooks |
| HTTP Client | axios |
| Backend | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.0 + Alembic |
| Database | PostgreSQL 15 + pgvector |
| Auth | AWS Cognito (JWT) |
| AI/ML | AWS Bedrock (Titan Embed v2) |
| Email | AWS SES (switched from SendGrid — keeps all infra within AWS) |
| Deployment | AWS Amplify (frontend) + Elastic Beanstalk (backend) |

---

## 3. CURRENT STATE AUDIT

### What EXISTS in `Phase_05/backend/` (DONE)

- ✅ FastAPI app structure (`main.py`, models, schemas, services, CRUD, endpoints)
- ✅ SQLAlchemy models: `User`, `ForumCategory`, `ForumTopic`, `ForumPost`, `FAQ`, `SupportTicket`
- ✅ pgvector columns on `ForumTopic.embedding` (384-dim) and `FAQ.embedding` (384-dim)
- ✅ Alembic migrations (9 migration files)
- ✅ AWS Cognito JWT verification middleware (`app/core/security.py`)
- ✅ Role-based dependencies: `CurrentUserDep`, `AdminUserDep`, `AgentOrAdminDep`
- ✅ Forum endpoints: `GET/POST /forum/topics`, `GET /forum/topics/{id}`, `GET/POST /forum/topics/{id}/posts`
- ✅ FAQ endpoints: `GET/POST/PUT/DELETE /faq/`, `POST /faq/{id}/vote`
- ✅ Category endpoints: `GET/POST/DELETE /categories/`
- ✅ AI endpoint: `POST /ai/suggest` (Bedrock embedding → pgvector search)
- ✅ Search endpoint: `GET /search/` (semantic search)
- ✅ `ai_service.py` with `generate_embedding()` and `search_similar_content()`
- ✅ Seed scripts (`seed_support.py`, `seed_phase2_data.py`)

### What EXISTS in `Phase_02/UI-UX/Barret_theses_2.0/` (design reference — Osomba 2.0 Theme)

- ✅ 9 page components (all with mock/hardcoded data):
  - `HomePage.tsx`, `FAQPage.tsx`, `AIHelpPage.tsx`, `PostQuestionPage.tsx`
  - `ThreadDetailPage.tsx`, `AgentDashboardPage.tsx`, `AnalyticsDashboardPage.tsx`
  - `UserManagementPage.tsx` (NEW), `CategoryManagementPage.tsx` (NEW)
- ✅ Osomba brand theme: orange (#F67C01) + green (#46BB39) gradient identity
- ✅ OrganicBackground component with SVG shapes (Vector, Leaf decorative elements)
- ✅ Redesigned Header with Osomba logo icon, gradient colors, floating "Ask Question" FAB
- ✅ Redesigned Sidebar with orange/green active states
- ✅ Admin sidebar with orange→green gradient
- ✅ `globals.css` with Osomba CSS variables and organic background styles
- ✅ `imports/` directory with SVG components (Vector.tsx, Leaf5.tsx, path data files)
- ✅ 10+ custom components + 45+ shadcn/ui components
- ✅ Tailwind config, design guidelines

### What Was Built (All Steps Complete)

- ✅ `Phase_05/frontend/` — full React + Vite app with Osomba 2.0 theme applied
- ✅ API client layer — axios instance with Cognito JWT interceptor, all mock data replaced
- ✅ Auth UI — login, register (with email verification), logout, all wired to AWS Cognito
- ✅ Official Answer endpoint — agents mark accepted answers, green highlight in UI, email sent
- ✅ Convert Forum Answer → FAQ — admin one-click conversion with auto-generated embedding
- ✅ Lock/Unlock thread endpoint — agents lock threads after resolution, unlock if needed
- ✅ `AiQueryLog` model + telemetry — every AI query logged, deflection rate computed live
- ✅ Admin analytics endpoints — overview KPIs, posts over time, category distribution, top queries
- ✅ Admin user management — search users, change roles with confirmation dialog
- ✅ Category update (`PUT /categories/{id}`) — full CRUD for categories including archive/restore
- ✅ Email notifications via AWS SES — switched from SendGrid, notifications on official answers
- ✅ EN/FR language scaffolding — complete `en.json` + `fr.json`, live Bedrock translation on API
- ✅ FAQ seed data with real embeddings — 20 FAQs seeded, AI search returns real results
- ✅ FAQ voting — Helpful / Not Helpful on every FAQ article
- ✅ "Still Need Help?" — pre-filled post form from AI page, query passed as state
- ✅ Agent Dashboard — unanswered thread queue, urgency flags, category/date filters
- ✅ Customer Context sidebar — agent sees customer orders, payments, past posts on thread view
- ✅ Analytics Dashboard — charts (recharts), KPI cards, CSV export
- ✅ Category Management page — create/edit/archive categories with emoji icons
- ✅ User Management page — search, filter by role, role change with audit warning
- ✅ Settings page — notification preferences, marketing opt-in
- ✅ Responsive design — skeleton loaders, error states, toast notifications on all pages

---

## 4. EXECUTION STEPS

> **Instructions for AI Agent:** Execute these steps sequentially. Each step lists exact files to create/modify, endpoints to build, and acceptance criteria. Do NOT skip steps. After each step, verify acceptance criteria before proceeding.

---

### STEP 1: Frontend Project Setup + Osomba 2.0 Theme ✅ DONE
**Goal:** Create `Phase_05/frontend/` as a working React + Vite app with Osomba branding.

**Tasks:**
- [x] **1.1** Copy `Phase_02/UI-UX/Figma_code/` into `Phase_05/frontend/`
- [x] **1.2** Run `npm install` to verify it builds
- [x] **1.3** Install additional dependencies: `axios`, `aws-amplify`, `@aws-amplify/auth`, `typescript`, `@types/react`, `@types/react-dom`
- [x] **1.4** Create `Phase_05/frontend/.env` with `VITE_API_URL`, Cognito placeholders
- [x] **1.5** Create `Phase_05/frontend/src/lib/api.ts` — centralized axios instance with Cognito JWT interceptor
- [x] **1.6** Create `Phase_05/frontend/src/lib/auth.ts` — Amplify config + login/register/logout/role helpers
- [x] **1.7** Updated `App.tsx` with routes split by access level (public / auth / agent / admin)
- [x] **1.8** Applied Osomba 2.0 theme from `Phase_02/UI-UX/Barret_theses_2.0/`:
  - Copied `globals.css` with Osomba CSS variables (orange #F67C01, green #46BB39)
  - Copied redesigned `Header.tsx` (logo, gradient branding, floating "Ask Question" FAB)
  - Copied `OrganicBackground.tsx` with decorative SVG shapes
  - Copied redesigned `Sidebar.tsx` with orange/green active states
  - Copied `imports/` directory (Vector.tsx, Leaf5.tsx, SVG path data)
  - Copied 2 new pages: `UserManagementPage.tsx`, `CategoryManagementPage.tsx`
  - Updated all pages with new Osomba-themed designs
  - Added routes: `/admin/users`, `/admin/categories`
  - Fixed all `react-router` → `react-router-dom` imports

**Acceptance Criteria:** ✅
- `vite build` compiles cleanly (2249 modules, 0 errors)
- All 9 pages route correctly (7 original + UserManagement + CategoryManagement)
- Osomba orange/green theme applied throughout
- OrganicBackground SVG shapes render on homepage
- axios instance + .env loaded

---

### STEP 2: Auth Context & Login/Register UI
**Goal:** Users can register, log in, log out via AWS Cognito. Role is available in React context.

**Prospectus Ref:** Deliverable 1e (Roles & Access)

**Tasks:**
- [x] **2.1** Create `src/context/AuthContext.tsx`:
  - State: `user`, `role` (customer/agent/admin), `isAuthenticated`, `loading`
  - Functions: `login()`, `register()`, `logout()`, `refreshSession()`
  - On mount: check for existing Cognito session
  - Extract role from `cognito:groups` claim in JWT
- [x] **2.2** Create `src/pages/LoginPage.tsx`:
  - Email + password form
  - "Don't have an account? Register" link
  - Error display for invalid credentials
- [x] **2.3** Create `src/pages/RegisterPage.tsx`:
  - Email + password + name form
  - Email verification code step
  - On success → redirect to login
- [x] **2.4** Update `Header.tsx` component:
  - Show user name + role badge when logged in
  - Show Login/Register buttons when logged out
  - Show Logout button when logged in
  - Conditionally show "Agent Dashboard" link for agents
  - Conditionally show "Analytics" link for admins
- [x] **2.5** Create `src/components/ProtectedRoute.tsx`:
  - Redirects to login if not authenticated
  - Optional `requiredRole` prop for agent/admin pages

**Acceptance Criteria:**
- User can register → verify email → log in → see their name in header
- Logging out clears session and redirects to home
- Agent/admin pages blocked for customers
- JWT access token attached to all API requests via axios interceptor

---

### STEP 3: Backend Gaps — Official Answer, Lock Thread, Convert to FAQ, Query Logging
**Goal:** Build all missing backend endpoints required by the user flows.

**Tasks:**

#### 3.1 — AiQueryLog Model + Migration
- [x] Add to `app/models/support.py`:
  ```python
  class AiQueryLog(Base):
      __tablename__ = "ai_query_logs"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
      query_text = Column(Text, nullable=False)
      results_returned = Column(Integer, default=0)
      top_result_score = Column(Float, nullable=True)
      escalated_to_forum = Column(Boolean, default=False)
      created_at = Column(DateTime(timezone=True), server_default=func.now())
  ```
- [x] Run `alembic revision --autogenerate -m "add ai_query_logs table"` then `alembic upgrade head`

#### 3.2 — Official Answer Endpoint
**Flow Ref:** `agent_flow.mmd` → "Submit Official Answer" → "Thread Status: Answered"
- [x] Add to `forum.py` endpoint:
  ```
  POST /forum/topics/{topic_id}/official-answer
  ```
  - Body: `{ "content": "..." }`
  - Auth: `AgentOrAdminDep`
  - Logic: Create a `ForumPost` with `is_accepted_answer=True`, optionally lock the thread
  - Return: Updated topic with status "Answered"

#### 3.3 — Lock/Unlock Thread Endpoint
**Flow Ref:** `agent_flow.mmd` → Agent can lock/close thread after answering
- [x] Add to `forum.py` endpoint:
  ```
  PATCH /forum/topics/{topic_id}/lock
  ```
  - Body: `{ "is_locked": true }`
  - Auth: `AgentOrAdminDep`
  - Sets `ForumTopic.is_locked`

#### 3.4 — Convert Forum Answer to FAQ
**Flow Ref:** `agent_flow.mmd` → "Bookmark as FAQ" → "Edit FAQ Draft" → "Publish FAQ"
- [x] Add to `faq.py` endpoint:
  ```
  POST /faq/convert-from-forum
  ```
  - Body: `{ "topic_id": int, "post_id": int }`
  - Auth: `AgentOrAdminDep`
  - Logic:
    1. Read the `ForumTopic.title` → FAQ question
    2. Read the `ForumPost.content` (the official answer) → FAQ answer
    3. Generate embedding via `ai_service.generate_embedding()`
    4. Create `FAQ` record with the embedding
  - Return: The new `FAQResponse`

#### 3.5 — AI Query Logging
**Flow Ref:** `ai_flow.mmd` → "Log Query Escalated = True/False"
- [x] Modify `POST /ai/suggest` in `ai.py`:
  - After search, log to `AiQueryLog`:
    - `query_text`, `results_returned`, `top_result_score`, `escalated_to_forum=False`
  - Return `session_id` (the log ID) in response so frontend can mark escalation later
- [x] Add endpoint:
  ```
  POST /ai/escalate
  ```
  - Body: `{ "session_id": int }`
  - Updates `AiQueryLog.escalated_to_forum = True`

#### 3.6 — Category Update Endpoint
**Flow Ref:** `admin_flow.mmd` → "Edit Category Details"
- [x] Add to `categories.py`:
  ```
  PUT /categories/{category_id}
  ```
  - Body: `ForumCategoryCreate` (name, description, icon, is_active)
  - Auth: `AdminUserDep`

#### 3.7 — Admin Analytics Endpoints
**Flow Ref:** `admin_flow.mmd` → "View KPI Dashboard" → metrics + charts
- [x] Add to `admin.py`:
  ```
  GET /admin/analytics/overview
  ```
  Returns:
  - `total_posts`: count of ForumTopics
  - `total_answered`: count where has official answer
  - `total_faqs`: count of active FAQs
  - `total_ai_queries`: count of AiQueryLog rows
  - `deflection_rate`: (queries NOT escalated / total queries) × 100
  - `avg_response_time`: placeholder or computed from timestamps

  ```
  GET /admin/analytics/posts-over-time
  ```
  Returns: `[{ "date": "2026-02-01", "count": 5 }, ...]` grouped by day

  ```
  GET /admin/analytics/category-distribution
  ```
  Returns: `[{ "category": "Payments", "count": 12 }, ...]`

  ```
  GET /admin/analytics/top-queries
  ```
  Returns: Top 10 AI queries by frequency from `ai_query_logs`

#### 3.8 — Admin User Management
**Flow Ref:** `admin_flow.mmd` → "Change Role: Customer → Agent → Admin"
- [x] Add to `admin.py`:
  ```
  GET /admin/users?search=email
  ```
  - Returns list of users matching search
  ```
  PUT /admin/users/{user_id}/role
  ```
  - Body: `{ "role": "agent" | "admin" | "customer" }`
  - Auth: `AdminUserDep`
  - Updates user role in DB (and optionally Cognito group)

#### 3.9 — Email Notification on Official Answer
**Flow Ref:** `agent_flow.mmd` → "Thread Status: Answered, Customer Gets Email"
**Note:** Originally planned with SendGrid. Switched to **AWS SES** during implementation to keep all infrastructure within AWS and avoid a third-party dependency.
- [x] In the official-answer endpoint (3.2), after creating the answer:
  - Call `email_service.send_notification_email()` via AWS SES to email the topic author
  - Subject: "Your question has been answered on Osomba Support"
  - Body: link to the thread

**Acceptance Criteria:**
- All new endpoints return correct responses
- `AiQueryLog` table exists and logs every AI query
- Official answer marks post as accepted + optionally locks thread
- FAQ conversion creates a new FAQ with embedding
- Admin gets analytics data in JSON format

---

### STEP 4: Wire Customer Flow (Frontend → Backend)
**Goal:** Replace ALL mock data in customer-facing pages with real API calls.

**Flow Ref:** `customer_flow.mmd`

**Tasks:**

#### 4.1 — HomePage.tsx
- [x] On mount: `GET /forum/topics` → display recent forum topics
- [x] On mount: `GET /faq/` → display recent FAQs in sidebar or section
- [x] Search bar: `GET /search/?query=...` → display combined FAQ + Forum results
- [x] Each result card links to `/thread/{id}` or `/faq` page
- [x] Show category badges, status badges, reply counts from API data

#### 4.2 — FAQPage.tsx
- [x] On mount: `GET /faq/` → render FAQ accordion list
- [x] Each FAQ shows "Was this helpful?" buttons
- [x] On vote click: `POST /faq/{id}/vote` with `{ is_helpful: true/false }`
- [x] Update helpful/not-helpful counts in UI after vote
- [x] Search/filter FAQs by keyword (client-side filter is fine)

#### 4.3 — PostQuestionPage.tsx
- [x] On mount: `GET /categories/` → populate category dropdown
- [x] Form fields: Title (min 10 chars), Body (min 20 chars), Category (required)
- [x] On submit: `POST /forum/topics` with `{ title, content, category_id }`
- [x] On success: redirect to the new thread page `/thread/{new_id}`
- [x] Auth required: redirect to login if not authenticated
- [x] Support pre-fill from query params: `?title=...&body=...&category=...` (for AI escalation)

#### 4.4 — ThreadDetailPage.tsx
- [x] On mount: `GET /forum/topics/{id}` → display topic title, content, author, status
- [x] On mount: `GET /forum/topics/{id}/posts` → display all replies
- [x] Reply form shown only if logged in AND thread not locked; if logged out show "Log in to reply" prompt
- [x] Highlight the accepted answer with a special badge/border
- [x] Show "Thread Locked" indicator if `is_locked=true`
- [x] Show "Answered" badge if any post has `is_accepted_answer=true`

**Acceptance Criteria:**
- HomePage loads real forum topics from API
- User can search and see combined FAQ + Forum results
- User can post a question with category selection → appears on homepage
- User can view thread, see replies, submit a reply
- FAQ page loads real FAQs with working vote buttons

---

### STEP 5: Wire AI Help Flow (Frontend → Backend)
**Goal:** AI Help Board works end-to-end: query → suggestions → click or escalate.

**Flow Ref:** `ai_flow.mmd`

**Tasks:**

#### 5.1 — AIHelpPage.tsx
- [x] Clean text input with minimum 10 character validation
- [x] On submit ("Get Help" button): `POST /ai/suggest` with `{ query, language: "en" }`
- [x] Show loading spinner during API call
- [x] Display results as cards, each showing:
  - Title
  - Snippet (first 150 chars)
  - Source badge ("FAQ" or "Forum Post")
  - Confidence score as stars (5 stars = 80-100%, 4 = 60-79%)
  - Category badge
- [x] If no results (or all below threshold): show "No good matches found" message
- [x] "Still Need Help?" button → navigate to `/post-question?title={query}&body={query}`
- [x] On clicking a result: navigate to `/thread/{id}` (forum) or scroll to FAQ (faq)
- [x] On escalation click: `POST /ai/escalate` with `{ session_id }` before navigating

**Acceptance Criteria:**
- Typing a question and clicking "Get Help" returns real suggestions from the database
- Results show confidence scores and source badges
- "Still Need Help?" pre-fills the post question form
- Every query is logged in `ai_query_logs`
- Escalation is tracked when user clicks "Still Need Help?"

---

### STEP 6: Wire Agent Flow (Frontend → Backend)
**Goal:** Agents can view open threads, see customer order context, post official answers, and convert answers to FAQs.

**Flow Ref:** `agent_flow.mmd`

> **Key Design Decision:** The thesis backend shares the same PostgreSQL database as the Osomba capstone app. The `users`, `orders`, `order_items`, and `payment` tables already exist and are joined via `users.user_id`. Agents can therefore see the customer's actual marketplace activity — order count, recent orders, payment status, disputes — directly alongside their support thread. This makes the forum a **context-aware** support tool, not just a generic Q&A board.

**Tasks:**

#### 6.0 — Backend: Customer Context Endpoint
**This endpoint reads from the shared capstone DB tables to give agents marketplace context.**

> **How the agent knows which customer to look up:** When a customer posts a forum thread, they are authenticated via Cognito JWT. The backend automatically sets `forum_topics.user_id` from their token at post time. When an agent opens the thread, `topic.user_id` is already in the thread response — the frontend calls the context endpoint using that ID automatically. The agent sees the context panel without doing anything manual.
>
> **Secondary lookup — by email:** An agent can also manually search by email (e.g. if a customer contacts them via other channels). This uses the existing `GET /admin/users?search=email` endpoint.

- [x] Add to `admin.py`:
  ```
  GET /admin/users/{user_id}/support-context
  ```
  - Auth: `AgentOrAdminDep`
  - Queries (all from shared DB):
    - `SELECT COUNT(*) FROM orders WHERE buyer_id = user_id` → total order count
    - `SELECT * FROM orders WHERE buyer_id = user_id ORDER BY order_id DESC LIMIT 5` → last 5 orders (with items + payment status)
    - `SELECT COUNT(*) FROM payment WHERE order_id IN (...) AND payment_status = 'FAILED'` → failed payment count
    - `SELECT * FROM forum_topics WHERE user_id = user_id` → past forum posts (how many open/resolved)
    - `User.full_name`, `User.email`, `User.created_at`, `User.country`, `User.is_onboarded`
  - Returns:
    ```json
    {
      "user_id": 42,
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "country": "DRC",
      "member_since": "2025-09-01",
      "total_orders": 8,
      "failed_payments": 1,
      "recent_orders": [
        {
          "order_id": 101,
          "total_cost": 45.00,
          "shipping_status": "Not Shipped",
          "payment_status": "COMPLETED",
          "items_count": 2
        }
      ],
      "past_forum_posts": 3,
      "past_resolved_posts": 2
    }
    ```

#### 6.1 — AgentDashboardPage.tsx
- [x] Protected route: only `agent` or `admin` role
- [x] On mount: `GET /forum/topics` → filter/display unanswered threads (status != "Answered")
- [x] Sort options: by date (newest first), by view count
- [x] Filter by category dropdown: `GET /categories/` → filter client-side or with query param
- [x] Each thread card shows: title, category, date, view count, reply count, **customer name**
- [x] Click → navigate to `/thread/{id}` (agent view)

#### 6.2 — Agent Context Panel on ThreadDetailPage.tsx
- [x] When agent views a thread, show a **sidebar "Customer Context" panel** on the right:
  - Fetch: `GET /admin/users/{topic.user_id}/support-context`
  - Display:
    - Customer name, country, member since date
    - Total orders badge (e.g. "8 orders")
    - Recent 3 orders: order ID, amount, shipping status, payment status
    - Failed payments warning (red badge if > 0)
    - Past support posts: "3 posts, 2 resolved"
  - This gives agents instant context to answer accurately without asking follow-up questions
  - Example: Customer asks "Why hasn't my order shipped?" → agent can immediately see order #101 is "Not Shipped" + payment was "COMPLETED"

#### 6.3 — Agent Actions on ThreadDetailPage.tsx
- [x] If user role is `agent` or `admin`, show extra action buttons:
  - **"Submit Official Answer"** button → opens rich text reply form
    - On submit: `POST /forum/topics/{id}/official-answer` with `{ content }`
    - After success: thread status updates to "Answered", customer gets email
  - **"Lock Thread"** button (after answering):
    - `PATCH /forum/topics/{id}/lock` with `{ is_locked: true }`
  - **"Convert to FAQ"** button (only visible if thread has an official answer):
    - `POST /faq/convert-from-forum` with `{ topic_id, post_id }`
    - Shows success toast: "FAQ created successfully!"

#### 6.4 — Answer Preview
- [x] Before submitting official answer, show preview of formatted answer
- [x] Agent can edit before final submission

**Acceptance Criteria:**
- Agent sees only unanswered threads on dashboard
- When agent opens a thread, they see a customer context panel showing real order/payment data
- Agent can submit an official answer → thread shows "Answered" status
- Agent can lock thread after answering
- Agent can convert an answered thread to FAQ with one click
- New FAQ gets an embedding and appears in AI search results
- Context panel correctly shows "8 orders, 1 failed payment" for a test user

---

### STEP 7: Wire Admin Flow (Frontend → Backend)
**Goal:** Admin can view KPI dashboard, manage categories, and promote users.

**Flow Ref:** `admin_flow.mmd`

**Tasks:**

#### 7.1 — AnalyticsDashboardPage.tsx
- [x] Protected route: only `admin` role
- [x] On mount: `GET /admin/analytics/overview` → display KPI cards:
  - Total Posts
  - Deflection Rate (%)
  - Total FAQs
  - Total AI Queries
- [x] Chart 1 — "Posts Over Time": `GET /admin/analytics/posts-over-time` → line chart (recharts)
- [x] Chart 2 — "Category Distribution": `GET /admin/analytics/category-distribution` → pie/bar chart
- [x] Chart 3 — "Top AI Queries": `GET /admin/analytics/top-queries` → table of top 10
- [x] Optional: "Export CSV" button → download data as CSV

#### 7.2 — Category Management Section
- [x] Display all categories: `GET /categories/`
- [x] "Add Category" form: name, description, icon → `POST /categories/`
- [x] "Edit Category" inline edit → `PUT /categories/{id}`
- [x] "Archive Category" (set `is_active=false`) → `PUT /categories/{id}` with `{ is_active: false }`

#### 7.3 — User Management Section
- [x] Search users by email/name: `GET /admin/users?search=...`
- [x] Display user list: email, name, current role
- [x] Role dropdown per user: Customer → Agent → Admin
- [x] On role change: `PUT /admin/users/{id}/role` with `{ role: "agent" }`
- [x] Confirmation dialog before role change

**Acceptance Criteria:**
- Admin dashboard shows real KPI metrics from the database
- Charts render with real data
- Admin can add/edit/archive categories
- Admin can promote a customer to agent role

---

### STEP 8: Seed Data & Embedding Generation
**Goal:** Populate the database with the 20 FAQ seeds + generate embeddings so AI search works.

**Source:** `Phase_03/artifacts/03_FAQ_Seeds.md`

**Tasks:**
- [x] **8.1** Create/update `Phase_05/backend/scripts/seed_faqs.py`:
  - Parse the 20 FAQ entries from the seed list
  - For each FAQ:
    1. Create `ForumCategory` if it doesn't exist (Payments, Listings, Safety, Disputes, Account, Delivery, General)
    2. Create `FAQ` record with question + answer
    3. Call `ai_service.generate_embedding(question + " " + answer)` → get 384-dim vector
    4. Set `FAQ.embedding = vector`
  - Print summary: "Seeded X FAQs with embeddings"

- [x] **8.2** Create sample forum topics with official answers:
  - Create 5-10 sample forum topics across categories
  - Create official answers for some of them
  - Generate embeddings for answered topics
  - This ensures AI search returns both FAQ and Forum results

- [x] **8.3** Create sample users:
  - 1 admin user
  - 2 agent users
  - 3 customer users
  - (Or configure via Cognito groups manually)

- [x] **8.4** Create sample `AiQueryLog` entries:
  - 20-30 sample queries with varied escalation rates
  - This populates the admin analytics dashboard for demo

- [x] **8.5** Run the seed script:
  ```bash
  cd Phase_05/backend
  python scripts/seed_faqs.py
  ```

**Acceptance Criteria:**
- 20 FAQs exist in database with embeddings
- 7 categories exist (Payments, Listings, Safety, Disputes, Account, Delivery, General)
- AI search returns relevant results for queries like "How do I pay with MPESA?"
- Admin dashboard shows non-zero metrics

---

### STEP 9: Language Scaffolding (EN/FR)
**Goal:** Prepare the React app to support English and French (DRC's official language).

**Tasks:**
- [x] **9.1** Setup `Phase_05/frontend/src/i18n/`:
  - `en.json` (English translations for App UI)
  - `fr.json` (French translations - mock them for now or use basic French)
- [x] **9.2** Setup `src/context/LanguageContext.tsx`:
  - Provide `t(key)` function and `language` state
- [x] **9.3** Add a language toggle to the `Header.tsx` (e.g., a simple EN/FR button).
- [x] **9.4** Wrap hardcoded English strings in key pages (Home, Submitting) with the `t('')` function.
- [x] **9.5** Pass the user's selected language to relevant backend API calls where language matters (e.g., the AI Help prompt should know they speak French).
- [x] **9.6** Pass `language` param in AI suggest request (already in schema)

**Acceptance Criteria:**
- Language toggle visible in header
- Switching to FR changes UI labels (at least navigation + buttons)
- New posts are tagged with language
- AI queries include language parameter

---

### STEP 10: Styling, Responsiveness & Polish
**Goal:** App looks professional and works on mobile screens.

**Tasks:**
- [x] **10.1** Ensure all pages are responsive (test at 375px, 768px, 1024px, 1440px)
- [x] **10.2** Mobile navigation: hamburger menu for sidebar on small screens
- [x] **10.3** Loading states: skeleton loaders on all data-fetching pages
- [x] **10.4** Error states: show user-friendly error messages when API calls fail
- [x] **10.5** Empty states: show helpful messages when no data (e.g., "No questions yet. Be the first to ask!")
- [x] **10.6** Toast notifications for success actions (post created, answer submitted, FAQ converted)
- [x] **10.7** Consistent use of Osomba brand colors from Tailwind config
- [x] **10.8** Ensure all interactive elements have hover/focus states for accessibility

**Acceptance Criteria:**
- App looks good on both mobile and desktop
- No layout breaks at any breakpoint
- All loading/error/empty states handled gracefully

---

### STEP 11: Testing & Verification
**Goal:** Verify every user flow works end-to-end.

**Tasks:**
- [x] **11.1** Customer Flow Test: Validate topic view, search, and post.
  - *Context:* Need solid unit/integration tests before finalizing backend.
  - *Action:* Write pytest functions for `/topics` and `/categories`.
  - *Validation:* `pytest tests/test_api_forum.py` passes.

- [x] **11.2** AI Flow Test: Use `/ai-help` with test questions and escalate.
  - *Context:* Ensure Bedrock proxy or mock works and escalation logs correctly.
  - *Action:* Write test for `/support/ai/suggest` and `/support/ai/escalate`.
  - *Validation:* Test passes, DB shows `AiQueryLog` entries.

- [x] **11.3** Agent Flow Test: Reply to topics, convert to FAQ.
  - *Context:* Test RBAC for Agents.
  - *Action:* Write test using an Agent token to hit `/official-answer` and `/convert-to-faq`.
  - *Validation:* Test passes, asserting `is_official = True`.

- [x] **11.4** Admin Flow Test: Review analytics charts and KPI cards.
  - *Context:* Need to verify admin routes return correct aggregations.
  - *Action:* Write test for `/admin/analytics/*` endpoints. *Included tests for support-context endpoint.*
  - *Validation:* Test passes. Log in as agent → see Agent Dashboard
  2. View unanswered threads → filter by category
  3. Open a thread → write and submit official answer
  4. Verify thread status changes to "Answered"
  5. Click "Convert to FAQ" → verify new FAQ appears in FAQ list
  6. Lock the thread → verify reply form is hidden

- [x] **11.4** Admin Flow Test:
  1. Log in as admin → see Analytics Dashboard
  2. Verify KPI cards show real numbers
  3. Verify charts render with data
  4. Go to Category Management → add a new category → verify it appears
  5. Go to User Management → search user → promote to agent
  6. Log in as that user → verify agent dashboard is accessible

- [x] **11.5** Cross-cutting Tests:
  - Auth: login → navigate → refresh page → still logged in
  - Auth: access agent page as customer → redirected to home
  - Responsive: all flows work on mobile viewport
  - Language: toggle EN/FR → labels change

**Acceptance Criteria:**
- All 4 user flows pass end-to-end
- No console errors in browser
- No unhandled API errors

---

### STEP 12: Thesis Defense Preparation
**Goal:** Everything needed for the March 6, 2026 defense.

**Tasks:**
- [x] **12.1** Record video demo (5-10 min) walking through all 4 user flows:
  - Customer: search → post question → receive answer
  - AI: query → suggestions → escalation
  - Agent: dashboard → official answer → convert to FAQ
  - Admin: analytics → category management → user promotion
- [x] **12.2** Take screenshots for thesis document:
  - Homepage, AI Help Board, Agent Dashboard, Analytics Dashboard
  - Mobile views of key pages
- [x] **12.3** Prepare architecture diagrams for thesis:
  - System architecture (frontend ↔ backend ↔ DB ↔ AWS)
  - RAG pipeline diagram (Query → Embedding → pgvector → Ranking → Display)
  - Auth flow diagram (already in Phase_3)
- [x] **12.4** Write thesis sections:
  - Chapter 1: Introduction & Motivation
  - Chapter 2: Literature Review (RAG, community forums, AI in customer support)
  - Chapter 3: System Design (architecture, tech stack, data models)
  - Chapter 4: Implementation (key code walkthrough, AWS Bedrock integration)
  - Chapter 5: Evaluation (KPI results from seed data, demo analysis)
  - Chapter 6: Conclusion & Future Work (French support, Claude integration, mobile app)
- [x] **12.5** Prepare defense slides (15-20 slides)

**Acceptance Criteria:**
- Video demo covers all 4 flows with working app
- Thesis document is complete and formatted per Barrett requirements
- Defense slides are ready

---

## 5. DEPENDENCY GRAPH

```
Step 1 (Frontend Setup)
  └─→ Step 2 (Auth UI)
        └─→ Step 4 (Customer Wiring)
        └─→ Step 5 (AI Wiring)
        └─→ Step 6 (Agent Wiring)  ← requires Step 3
        └─→ Step 7 (Admin Wiring)  ← requires Step 3

Step 3 (Backend Gaps) — can run in parallel with Steps 1-2

Step 8 (Seed Data) — after Step 3 (needs all endpoints)

Step 9 (i18n) — after Step 4 (needs working pages)

Step 10 (Polish) — after Steps 4-7 (needs all pages wired)

Step 11 (Testing) — after Steps 8-10 (needs everything)

Step 12 (Defense Prep) — after Step 11
```

---

## 6. FILE STRUCTURE (Target State)

```
Phase_05/
├── backend/                          # ✅ EXISTS
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   │   ├── admin.py              # ✅ DONE (analytics, user mgmt)
│   │   │   ├── ai.py                 # ✅ DONE (logging, escalation)
│   │   │   ├── categories.py         # ✅ DONE (full CRUD + PUT endpoint)
│   │   │   ├── faq.py                # ✅ DONE (convert-from-forum)
│   │   │   ├── forum.py              # ✅ DONE (official-answer, lock)
│   │   │   ├── search.py             # ✅ DONE
│   │   │   └── ... (auth, users)     # ✅ DONE
│   │   ├── models/
│   │   │   └── support.py            # ✅ DONE (AiQueryLog added)
│   │   ├── services/
│   │   │   ├── ai_service.py         # ✅ DONE
│   │   │   ├── email_service.py      # ✅ DONE (AWS SES — switched from SendGrid)
│   │   │   └── ...
│   │   └── ...
│   └── scripts/
│       └── seed_faqs.py              # ✅ DONE (20 FAQs with embeddings)
│
├── frontend/                          # ✅ DONE
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.tsx        # ✅ DONE
│   │   │   └── LanguageContext.tsx    # ✅ DONE
│   │   ├── i18n/
│   │   │   ├── en.json               # ✅ DONE
│   │   │   └── fr.json               # ✅ DONE
│   │   ├── lib/
│   │   │   ├── api.ts                # ✅ DONE (axios instance + JWT interceptor)
│   │   │   └── auth.ts               # ✅ DONE (Cognito helpers)
│   │   ├── pages/
│   │   │   ├── HomePage.tsx           # ✅ DONE (wired to API)
│   │   │   ├── FAQPage.tsx            # ✅ DONE (wired to API)
│   │   │   ├── AIHelpPage.tsx         # ✅ DONE (wired to API)
│   │   │   ├── PostQuestionPage.tsx   # ✅ DONE (wired to API)
│   │   │   ├── ThreadDetailPage.tsx   # ✅ DONE (wired to API)
│   │   │   ├── AgentDashboardPage.tsx # ✅ DONE (wired to API)
│   │   │   ├── AnalyticsDashboardPage.tsx # ✅ DONE (wired to API)
│   │   │   ├── LoginPage.tsx          # ✅ DONE
│   │   │   └── RegisterPage.tsx       # ✅ DONE
│   │   ├── components/
│   │   │   ├── Header.tsx             # ✅ DONE (auth + role badges)
│   │   │   ├── ProtectedRoute.tsx     # ✅ DONE
│   │   │   └── ...
│   │   └── App.tsx                    # ✅ DONE (router + providers)
│   ├── .env                           # ✅ DONE
│   └── package.json                   # ✅ DONE
```

---

## 7. API ENDPOINT REFERENCE (Complete)

### Public Endpoints (No Auth — anyone can read)
| Method | Path | Description |
|---|---|---|
| `GET` | `/forum/topics` | List forum topics |
| `GET` | `/forum/topics/{id}` | Get single topic |
| `GET` | `/forum/topics/{id}/posts` | Get replies for a topic |
| `GET` | `/faq/` | List all FAQs |
| `POST` | `/faq/{id}/vote` | Vote helpful/not helpful |
| `GET` | `/categories/` | List categories |
| `GET` | `/search/?query=...` | Unified semantic search |
| `POST` | `/ai/suggest` | AI suggestions |
| `POST` | `/ai/escalate` | Mark AI query as escalated |

### Authenticated Endpoints (Login Required — write actions only)
| Method | Path | Description |
|---|---|---|
| `POST` | `/forum/topics` | Create new topic |
| `POST` | `/forum/topics/{id}/posts` | Reply to topic |

### Agent Endpoints (Agent/Admin Auth)
| Method | Path | Description |
|---|---|---|
| `POST` | `/forum/topics/{id}/official-answer` | Submit official answer |
| `PATCH` | `/forum/topics/{id}/lock` | Lock/unlock thread |
| `POST` | `/faq/convert-from-forum` | Convert answer to FAQ |
| `POST` | `/faq/` | Create FAQ manually |
| `PUT` | `/faq/{id}` | Edit FAQ |
| `DELETE` | `/faq/{id}` | Delete FAQ |

### Agent Endpoints (Agent/Admin Auth) — continued
| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/users/{id}/support-context` | Customer marketplace context (orders, payments, history) |

### Admin Endpoints (Admin Auth Only)
| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/analytics/overview` | KPI summary |
| `GET` | `/admin/analytics/posts-over-time` | Posts by day |
| `GET` | `/admin/analytics/category-distribution` | Posts by category |
| `GET` | `/admin/analytics/top-queries` | Top AI queries |
| `GET` | `/admin/users` | Search users |
| `PUT` | `/admin/users/{id}/role` | Change user role |
| `POST` | `/categories/` | Create category |
| `PUT` | `/categories/{id}` | Update category |
| `DELETE` | `/categories/{id}` | Delete category |
| `GET` | `/admin/system-health` | Health check |

---

## 8. OUT OF SCOPE (Not Graded)

These items are explicitly **not** part of the thesis deliverables:
- Flutter mobile app integration (WebView linking)
- Real-time notifications (WebSocket/SSE)
- Claude 3 generative AI answers (only RAG retrieval for thesis)
- Payment integration
- Production deployment to AWS (local demo is sufficient for defense)
- Automated E2E testing (Playwright)
- French translations of FAQ content (only UI scaffolding required)

---

## 9. SUCCESS CRITERIA FOR DEFENSE

All steps 1-11 were completed. The following were verified:

- [x] A customer can search, post a question, and receive an answer
- [x] The AI Help Board returns relevant suggestions from real data
- [x] The AI Help Board escalates to forum with pre-filled form when no match
- [x] An agent can view open threads, submit official answers, and convert to FAQ
- [x] An admin can view analytics (deflection rate, top queries), manage categories, promote users
- [x] Roles are enforced (customers can't access agent/admin pages)
- [x] Language toggle exists (EN/FR) with complete translations and live Bedrock translation on API
- [x] All AI queries are logged for analytics
- [x] App is responsive on mobile and desktop
- [x] Video demo covers all 4 user flows
