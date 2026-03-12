# From Plan to Product — The Complete Project Story

## Osomba Marketplace: Unified Support Forum and FAQ with AI-Assisted Answers

**Barrett Honors Thesis | Yashu Gautamkumar Patel**
**Thesis Director:** Steven Osburn | **Sponsor:** Yannick Nkayilu Salomon (Kimuntu Power)
**Thesis Defense:** March 6, 2026

---

## The Problem

Osomba Marketplace is a multi-country buyer-seller platform serving users across Sub-Saharan
Africa in both English and French. As the platform grew, so did the support burden. Users asked
the same questions over and over — how to pay with MPESA, how to track an order, how to resolve
a dispute. There was no central place to find answers. Every question went directly to a human
agent. That model does not scale.

The thesis goal was to fix that with three things working together:

1. A **Customer Care Forum** where users can post questions and get official answers from Osomba agents
2. A **FAQ system** where the best answers get saved so the next user does not have to ask again
3. An **AI Help Board** that matches a user's question to existing content before they ever need to post

The idea was simple: over time the knowledge base grows on its own, and fewer questions need a
human to answer them.

---

## Phase 01 — Planning: Requirements, Database, and API Design

Before writing any code, the full system was planned on paper. Phase 01 produced four artifacts
that everything else was built against.

The **Requirements Document** defined the three user roles (Customer, Agent, Admin), the six
support categories (Payments, Listings, Safety, Disputes, Account, Delivery), and the hard
scope boundaries — no live chat, no video tutorials, no generative AI.

The **Database Schema** defined five core tables:

- `forum_categories` — the six support categories
- `forum_topics` — each support thread, with a 384-dimensional embedding column for semantic search
- `forum_posts` — replies to threads, with an `is_accepted_answer` flag agents can set
- `faqs` — curated articles, also with a 384-dimensional embedding column
- `ai_query_logs` — every AI search logged for analytics

One key architectural decision was made here: the thesis database would share the same PostgreSQL
instance as the capstone marketplace app. This meant agents could see a customer's real order
history and payment status alongside their support thread. Context-aware support, not just a
generic Q&A board.

The **API Endpoint Specification** mapped out every route before a single line of backend code
was written: `/forum`, `/faq`, `/ai`, `/search`, `/admin`, `/categories`.

---

## Phase 02 — Design: UI Mockups and User Flows

Phase 02 produced the visual target for the whole application before any backend integration
was done. The Osomba 2.0 design system was defined at this stage:

- Brand colors: orange `#F67C01` and green `#46BB39`
- OrganicBackground: SVG decorative shapes giving the app a distinctive, non-generic look
- Component library: CategoryBadge, StatusBadge, SkeletonLoader, QuestionCard

All nine pages were built as working React prototypes with hardcoded mock data in Figma and
as real components. This gave two advantages: a clear visual target, and pages that were already
structurally correct when it came time to replace mock data with real API calls.

Four complete user flows were mapped as Mermaid diagrams:

- **Customer flow:** browse → search → AI query → post question → receive official answer
- **Agent flow:** dashboard → read customer context → write official answer → lock → convert to FAQ
- **Admin flow:** analytics dashboard → category management → user role management
- **AI flow:** query → embed → rank → display confidence → escalate to forum

These diagrams were the specification Phase 05 was built against.

---

## Phase 03 — Research: AI Strategy, Auth, and Tech Decisions

Phase 03 confirmed the system was technically buildable and locked in the key technology decisions.

**AI Strategy:** The system would use RAG (Retrieval-Augmented Generation) — not a generative
chatbot. The AI would only retrieve and rank existing approved content. The reason was straightforward:
Osomba deals with real money and real transactions. Hallucinated answers about payment instructions
could cause real harm. AWS Bedrock Titan Embed Text v2 was chosen for embeddings over local
sentence-transformers because it requires no model to host — it is an API call, and it stays
within the same AWS account Osomba already operates on.

**Auth Flow:** AWS Cognito with Just-In-Time (JIT) provisioning. The first time a user logs in,
the system automatically creates their user record. Nobody has to set it up manually. Roles
(customer, agent, admin) are stored as Cognito groups and enforced at the JWT level in the
FastAPI backend — not just in the frontend.

**Translation:** Amazon Nova Micro for on-demand English to French translation. The decision
was to translate content only when it is requested, not to pre-translate everything. This keeps
API costs down and makes the pages load quickly.

**FAQ Seed Data:** 20 real FAQ entries across all six categories were written and ready to load,
so the AI search would have content to find from day one of the demo.

---

## Phase 04 — Execution Plan: Mapping Every Deliverable to a Build Step

Phase 04 was the detailed build specification. Every prospectus deliverable was mapped to a
concrete implementation step with acceptance criteria. Nothing was built speculatively.

The plan had 12 steps covering frontend setup, auth UI, backend gaps, all three user flow
wirings, seed data, language scaffolding, UI polish, testing, and thesis defense preparation.
The plan also explicitly defined what was out of scope so the thesis stayed focused: no mobile
app, no real-time WebSockets, no generative AI, no production deployment required for defense.

---

## Phase 05 — Building: What Was Actually Delivered

Every step in the execution plan was completed. Here is the full picture of what was built.

### Customer Experience

A customer lands on the home page and sees a forum interface with category filtering,
status badges (Open, Answered, Locked), reply counts, and a unified search bar. The search
bar has a ✨ AI button — clicking it navigates to the dedicated AI Help Page with the typed
query already filled in.

On the AI Help Page, the customer types a question in plain English or French and receives
ranked suggestion cards from existing FAQ articles and answered forum threads. Each card shows
a title, a short preview, the source type (FAQ or Forum Post), the category, and a confidence
score shown as stars out of five with a percentage. Cards scoring below 60% are faded with a
warning icon so the user knows the match may not be relevant.

If nothing matches, the customer clicks "Post to Forum" and lands on the Post Question Page
with their original query already in the title field. They pick a category, add detail, and
submit. When an agent posts an official answer, they receive an email with a direct link to
the thread.

### Agent Experience

An agent logs in and sees the Agent Dashboard — a queue of unanswered threads sorted by
urgency. Threads older than 24 hours are flagged in red. The queue can be filtered by category
and date range.

When an agent opens a thread, a Customer Context sidebar automatically appears on the right.
It shows the customer's order history, payment status, failed payment count, and past forum
activity — all pulled from the shared capstone database. The agent does not need to ask for
an order number. They can already see it.

The agent writes a reply, marks it as the Official Answer (which highlights it in green and
sends an email to the customer), and locks the thread. If the answer is broadly useful, they
click "Convert to FAQ." The system creates a new FAQ article, generates its 384-dimensional
Bedrock embedding automatically, and stores the `source_post_id` so the origin is always
traceable. If the conversion was a mistake, an Undo FAQ button lets the admin revert it.

### Admin Experience

The admin sees everything the agent sees, plus three additional management tools.

The **Analytics Dashboard** shows six KPI cards: total posts, total answered, active FAQs,
AI queries, deflection rate, and average response time. Deflection rate is the key thesis
metric — it measures what percentage of users got help from the AI without ever posting a
question. Two charts show posts over time and category distribution. All data can be exported
to CSV.

The **User Management Page** lets the admin search all users by email, filter by role, and
promote customers to agents or agents to admins. Role changes update both the database and
Cognito simultaneously so they take effect immediately.

The **Category Management Page** lets the admin create, edit, and archive the support
categories that appear throughout the forum and FAQ system.

---

## Prospectus vs. Delivered — Full Comparison

### Deliverable 1: Customer Care Forum + FAQ

| Prospectus Item | Delivered | How |
|---|---|---|
| 1a. Unified search bar (FAQ + forum, labeled) | ✅ Yes — exceeded | Semantic pgvector cosine search. Results labeled FAQ / Forum Post. ✨ AI button on home page navigates to AI Help Page |
| 1b. Post question flow with required category | ✅ Yes | Validation on title (min 10 chars) + body. Category required. Pre-filled from AI query |
| 1c. Official Answer + lock/close thread | ✅ Yes | Green highlight, email to customer via SES, lock/unlock controls for agents |
| 1d. Agent bookmark → FAQ one click | ✅ Yes — with extras | Admin one-click convert. Auto 384-dim embedding. `source_post_id` tracking. Undo FAQ added |
| 1e. Three roles, enforced access | ✅ Yes | Enforced at JWT level in FastAPI. Cognito groups are source of truth |
| 1f. English + French scaffolding | ✅ Yes — exceeded | Complete `en.json` + `fr.json`. Live on-demand translation via AWS Bedrock Nova Micro. Titles translate on home page load. Full body translates on thread open |

### Deliverable 2: AI Help Board

| Prospectus Item | Delivered | How |
|---|---|---|
| 2a. Ranked suggestions (title + preview) | ✅ Yes — exceeded | Bedrock Titan Embed v2 → 384-dim vector → pgvector cosine similarity. Confidence stars + percentage. Low-confidence cards faded with warning |
| 2b. Escalate to forum (prefilled) | ✅ Yes | "Post to Forum" passes query as pre-filled title via React Router state. Escalation logged before navigation |
| 2c. Logging and telemetry | ✅ Yes — exceeded | `ai_query_logs` stores query text, results count, top score, escalated flag. Deflection rate computed live |

### Extra Features (Beyond Prospectus)

| Feature | Why It Was Added |
|---|---|
| Agent Dashboard with urgency queue | Agents needed a triage view — scrolling past resolved threads wastes time |
| Customer Context sidebar | The shared database makes context-aware support possible — this is the key architectural differentiator |
| Analytics Dashboard | Required to evaluate thesis KPIs in real time |
| Category Management | Admins needed UI control over categories without database access |
| User Management | Role promotion needed a UI, not manual Cognito edits |
| Email notifications via AWS SES | Customers needed to know when their question was answered (switched from SendGrid to stay within AWS) |
| FAQ voting (Helpful / Not Helpful) | Feedback signal for FAQ quality |
| Undo FAQ | Admins need to be able to revert a conversion mistake |
| Auto-embedding on save | Every new topic and FAQ generates an embedding immediately so AI search is always current |
| Settings page | User notification preferences |
| Skeleton loaders + error states | Professional UX — no blank screens or raw error objects |

---

## The AI Architecture

The AI Help Board is a semantic retrieval system, not a chatbot. When a user submits a question:

1. The query is sent to AWS Bedrock Titan Embed Text v2, which produces a vector
2. That vector is stored as 384 dimensions in pgvector (truncated/zero-padded from model output)
3. pgvector's cosine distance operator (`<=>`) compares the query vector against every stored
   FAQ and forum topic embedding
4. Results are ranked by similarity score, returned with title, snippet, source type, and
   confidence stars
5. Every query is logged to `ai_query_logs` — this is how deflection rate is computed
6. If the user escalates to the forum, the log record is updated with `escalated_to_forum = true`

The system never generates a new answer. It only retrieves and ranks existing approved content.
This was a deliberate design choice. In a support context where incorrect information about
payments or disputes could cause real harm, accuracy matters more than fluency.

---

## Key Technical Decisions and Why They Changed

| Decision | Originally Planned | What Was Built | Reason |
|---|---|---|---|
| Email | SendGrid | AWS SES | Keep all infrastructure in one AWS account |
| Embeddings | Local sentence-transformers | AWS Bedrock Titan Embed v2 | Local model too slow on cold start, not viable in production |
| Translation | Pre-translate and store both languages | On-demand via Bedrock Nova Micro | Users post new content constantly — pre-translation is not feasible |
| Vector dimensions | 384-dim target | 384-dim enforced with truncate/pad | Bedrock output can vary; pgvector requires a fixed dimension |
| AI interface | Separate AI Help Page only | Home page ✨ AI button + dedicated AI Help Page | Better UX — one entry point, AI accessible from anywhere |

---

## What Was Left Out (And Why)

| Item | Reason |
|---|---|
| Mobile app integration | Flutter app is the capstone team's scope, not thesis |
| Real-time notifications (WebSocket) | Significant infrastructure complexity for a demo |
| Generative AI answers | Deliberate choice — retrieval-only for accuracy |
| Production deployment | Local demo is sufficient for defense per thesis requirements |
| French FAQ content translation | UI scaffolding + live translation on request is sufficient; full content translation is future work |

---

## Summary

The thesis began with a prospectus making nine specific deliverable promises. It became a
twelve-step execution plan in Phase 04. It ended as a fully working web application with three
distinct user experiences, a live semantic search system, real-time analytics, and bilingual
support that goes beyond the original scaffolding requirement.

Every prospectus deliverable was built. Every execution plan step was completed. The system
runs on real AWS services, is seeded with twenty FAQ articles and their embeddings, and is
ready to demonstrate.

---

*Phase 06 — Thesis Defense Documentation | March 2026*
