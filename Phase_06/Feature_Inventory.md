# Phase 06 — Feature Inventory
## Proposed vs. Delivered

**Project:** Osomba Marketplace: Unified Support Forum and FAQ with AI-Assisted Answers
**Student:** Yashu Gautamkumar Patel
**Thesis Director:** Steven Osburn
**Defense:** March 6, 2026

---

## Part 1 — Prospectus Deliverables (What Was Proposed)

### Deliverable 1: Customer Care Forum + FAQ (MVP)

| # | What Was Promised |
|---|---|
| 1a | Unified search bar pulling results from both FAQ articles and forum threads, with clear labels showing which is which |
| 1b | Post question flow where users create a new thread and must select a category (Payments, Listings, Safety, Disputes, Account, Delivery, or Other) |
| 1c | Official Answer feature for agents, including the ability to lock or close a thread once resolved |
| 1d | Agent bookmark → FAQ function: convert an official answer into a FAQ article with one click |
| 1e | Three user types (Customer, Agent, Admin) with appropriate permissions enforced for each |
| 1f | Built in English, with French scaffolding in place (string catalogs and language switch ready) |

### Deliverable 2: AI Help Board

| # | What Was Promised |
|---|---|
| 2a | Users ask a question and receive ranked suggestions — most relevant FAQ articles and forum threads — with titles and short previews |
| 2b | If suggestions aren't helpful, users can post directly to the forum from the AI board (prefilled title/body + category picker) |
| 2c | Basic logging and telemetry: track what users ask, which sources are shown, and when users escalate to the forum |

---

## Part 2 — What Was Actually Delivered

### Deliverable 1: Customer Care Forum + FAQ

| # | Promised | Delivered | Notes |
|---|---|---|---|
| 1a | Unified search bar (FAQ + forum, labeled) | ✅ Yes — exceeded | Semantic vector search via pgvector cosine distance. Results labeled "FAQ" or "Forum Post". AI button (✨ AI) on the home page search bar navigates to the dedicated AI Help Page |
| 1b | Post question flow with required category | ✅ Yes | `PostQuestionPage` — title (min 10 chars) + body validation, category dropdown populated from `/support/categories`. Query pre-filled when coming from AI board |
| 1c | Official Answer + lock/close thread | ✅ Yes | Agents mark a reply as official answer → highlighted in green → email sent to customer via AWS SES → thread status changes to "Answered". Lock/unlock thread controls available |
| 1d | One-click FAQ conversion | ✅ Yes — with extras | Admin converts official forum answer to FAQ. System generates 384-dim Bedrock embedding automatically. `source_post_id` stored to track origin. Undo FAQ button added so admin can revert a conversion |
| 1e | Three roles with enforced access | ✅ Yes | Enforced at JWT level in FastAPI (not just frontend guards). `CustomerDep`, `AgentOrAdminDep`, `AdminUserDep` applied per endpoint. Cognito groups are the source of truth |
| 1f | English + French scaffolding | ✅ Yes — exceeded | Complete `en.json` + `fr.json` string catalogs for all UI labels. Language toggle in header. Live on-demand translation via AWS Bedrock Nova Micro — forum titles translate on home page, full body translates on thread open. Not just scaffolding — it works |

### Deliverable 2: AI Help Board

| # | Promised | Delivered | Notes |
|---|---|---|---|
| 2a | Ranked suggestions (FAQ + forum, title + preview) | ✅ Yes — exceeded | AWS Bedrock Titan Embed Text v2 generates query embedding → pgvector cosine similarity search across `forum_topics` and `faqs` tables → results ranked by score. Confidence shown as stars (1–5) and percentage. Cards show title, snippet, category, and source badge. Results below 60% are faded with a warning icon |
| 2b | Escalate to forum from AI board (prefilled) | ✅ Yes | "Post to Forum" button on AI Help Page passes query as pre-filled title to `PostQuestionPage` via React Router state. Escalation event is logged before navigation |
| 2c | Logging and telemetry | ✅ Yes — exceeded | Every AI query logged to `ai_query_logs` table: query text, results returned, top result score, escalated flag, user ID, timestamp. Deflection rate computed live in Analytics Dashboard |

---

## Part 3 — Extra Features Delivered (Beyond Prospectus)

These were not promised in the prospectus. They were identified during Phase 4 planning and built in Phase 5 because the system could not work well without them.

| Feature | Where in App | Why It Was Needed |
|---|---|---|
| **Agent Dashboard** | `AgentDashboardPage` | Agents needed a dedicated queue of unanswered threads, sorted by urgency (red flag for threads > 24 hours old), filterable by category and date range |
| **Customer Context Panel** | `ThreadDetailPage` (agent/admin view) | When an agent opens a thread, a sidebar shows the customer's order history, payment status, and past forum posts — pulled from the shared capstone database. Agents do not need to ask for order numbers |
| **Analytics Dashboard** | `AnalyticsDashboardPage` | Admin KPI view required to evaluate thesis outcomes: deflection rate, average response time, posts over time chart, category distribution chart. CSV export included |
| **Category Management** | `CategoryManagementPage` | Admins needed to create and edit support categories without database access. Includes emoji icons and live post counts |
| **User Management** | `UserManagementPage` | Admins needed a UI to search users, filter by role, and promote customers to agents — with a confirmation dialog to prevent accidental changes. Updates both DB and Cognito simultaneously |
| **Email Notifications** | `email_service.py` + AWS SES | Customers receive an email with a direct thread link when an agent posts an official answer. Originally planned with SendGrid; switched to AWS SES to keep all infrastructure within one AWS account |
| **FAQ Voting** | `FAQPage` | Helpful / Not Helpful buttons on every FAQ article give the support team a feedback signal for FAQ quality |
| **Undo FAQ** | `ThreadDetailPage` (admin view) | If a FAQ conversion was a mistake, the admin can revert it. The source post is tracked via `source_post_id` on the FAQ record |
| **Auto-Embedding on Save** | `forum_service.py`, `faq_service.py` | Every new forum topic, post, and FAQ automatically generates a Bedrock embedding on creation so it is immediately searchable by the AI |
| **Settings Page** | `SettingsPage` | User notification preferences and marketing opt-in management |
| **Skeleton Loaders + Error States** | All pages | Every data-loading page has skeleton loaders, user-friendly error messages, and empty state messages — no blank screens |

---

## Part 4 — Feature Breakdown by Role

### Customer

| # | Feature | Page / Endpoint |
|---|---|---|
| 1 | Register + email verification | `RegisterPage` → AWS Cognito |
| 2 | Login / logout | `LoginPage` → AWS Cognito |
| 3 | Browse forum topics by category | `HomePage` |
| 4 | Search forum + FAQ together (labeled results) | `HomePage` → `POST /support/ai/suggest` |
| 5 | Click ✨ AI button → go to AI Help Page | `HomePage` → `/ai-help` |
| 6 | Ask AI a question, get ranked suggestions with confidence stars | `AIHelpPage` → `POST /support/ai/suggest` |
| 7 | Escalate AI query to forum with pre-filled title | `AIHelpPage` → `PostQuestionPage` |
| 8 | Post a new question with required category | `PostQuestionPage` → `POST /support/topics` |
| 9 | View a thread and all replies | `ThreadDetailPage` |
| 10 | Reply to a thread (if not locked) | `ThreadDetailPage` → `POST /support/topics/{id}/posts` |
| 11 | Browse FAQ articles | `FAQPage` |
| 12 | Vote FAQ helpful / not helpful | `FAQPage` → `POST /support/faqs/{id}/vote` |
| 13 | Switch language EN ↔ FR | Header toggle → live Bedrock translation |
| 14 | Receive email when official answer is posted | Email via AWS SES |
| 15 | Manage notification preferences | `SettingsPage` |

### Agent (all Customer features plus)

| # | Feature | Page / Endpoint |
|---|---|---|
| 1 | View Agent Dashboard — unanswered thread queue | `AgentDashboardPage` |
| 2 | Filter queue by category, date, urgency | `AgentDashboardPage` |
| 3 | View Customer Context sidebar on any thread | `ThreadDetailPage` → `GET /admin/users/{id}/support-context` |
| 4 | Mark a reply as Official Answer | `ThreadDetailPage` → `POST /support/topics/{id}/official-answer` |
| 5 | Lock / unlock a thread | `ThreadDetailPage` → `POST /support/topics/{id}/lock` |
| 6 | Create and edit FAQ articles manually | `FAQPage` → `POST/PUT /support/faqs` |

### Admin (all Agent features plus)

| # | Feature | Page / Endpoint |
|---|---|---|
| 1 | Convert official answer to FAQ (one click) | `ThreadDetailPage` → `POST /support/topics/{id}/convert-to-faq` |
| 2 | Undo FAQ conversion | `ThreadDetailPage` → `DELETE /support/topics/{id}/undo-faq/{post_id}` |
| 3 | Delete FAQ articles | `FAQPage` → `DELETE /support/faqs/{id}` |
| 4 | View Analytics Dashboard (KPIs + charts) | `AnalyticsDashboardPage` → `GET /admin/analytics/*` |
| 5 | Export analytics data as CSV | `AnalyticsDashboardPage` |
| 6 | Manage Categories (create / edit / archive) | `CategoryManagementPage` → `POST/PUT/DELETE /support/categories` |
| 7 | Manage Users (search, filter by role, change roles) | `UserManagementPage` → `GET/PUT /admin/users` |

---

## Part 5 — Final Technical Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Typed, fast build |
| Styling | Tailwind CSS + Osomba theme (orange #F67C01 / green #46BB39) | OrganicBackground SVG shapes |
| HTTP Client | axios + Cognito JWT interceptor | Auto-attaches auth token to every request |
| Backend | FastAPI (Python 3.11+) | Async, typed, auto OpenAPI docs |
| ORM | SQLAlchemy 2.0 + Alembic | Typed queries, full migration history |
| Database | PostgreSQL 15 + pgvector extension | Shared with capstone, vector search built in |
| Authentication | AWS Cognito (JIT provisioning) | First login auto-creates user record |
| AI Embeddings | AWS Bedrock Titan Embed Text v2 | 384-dim vectors stored in pgvector (truncated/padded from model output) |
| AI Translation | AWS Bedrock Nova Micro | On-demand EN → FR translation per request |
| Email | AWS SES | Notification on official answer (switched from SendGrid) |
| i18n | `en.json` + `fr.json` string catalogs | All UI labels translated |
| Deployment (planned) | AWS Elastic Beanstalk (backend) + S3/CloudFront (frontend) | Local for thesis demo |

---

## Part 6 — KPIs Tracked

| KPI | Definition | Source |
|---|---|---|
| Deflection Rate | % of AI queries that did NOT escalate to forum | `ai_query_logs.escalated_to_forum` |
| Avg Response Time | Hours from thread creation to first official answer | `forum_topics.created_at` vs `forum_posts.created_at` where `is_accepted_answer=true` |
| Total Posts | Total forum topics created | Count of `forum_topics` |
| Total Answered | Threads with at least one official answer | Count where accepted answer exists |
| Active FAQs | Published FAQ articles | Count of `faqs` where `is_active=true` |
| AI Query Volume | Total questions asked to AI Help Board | Count of `ai_query_logs` rows |
| Top AI Queries | Most common questions users ask | Frequency grouping on `ai_query_logs.query_text` |
| Category Distribution | Which categories generate the most posts | `forum_topics.category_id` grouping |
| FAQ Helpfulness | Helpful vs. not-helpful votes per FAQ | `faqs.helpful_count` / `faqs.not_helpful_count` |

---

*Phase 06 — Thesis Defense Documentation | March 2026*
