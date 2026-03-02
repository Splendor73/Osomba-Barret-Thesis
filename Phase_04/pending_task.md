# Osomba Forum — Pending Tasks (Production-Ready Checklist)

> **Goal**: Every page works end-to-end with real AWS Cognito auth, real PostgreSQL data, and real Bedrock AI embeddings. No hardcoded/mock data remains.

---

## SECTION 0: Backend Config & Database Setup ✅ DONE

### Task 0.1 — Add missing `ai_similarity_threshold` to config ✅
- **File**: `Phase_05/backend/app/core/config.py`
- **Problem**: `search_service.py:17` reads `settings.ai_similarity_threshold` but it's NOT defined in Settings class → crash at runtime
- **Fix**: Add to Settings class:
  ```python
  ai_similarity_threshold: float = Field(default=0.5, alias="AI_SIMILARITY_THRESHOLD")
  ```

### Task 0.2 — Create Alembic migration for FAQ.category_id column ✅
- **File**: `Phase_05/backend/alembic/`
- **Problem**: FAQ model now has `category_id` FK column but the DB table doesn't have it yet
- **Fix**: Run `alembic revision --autogenerate -m "add category_id to faqs"` then `alembic upgrade head`
- **Verify**: `SELECT column_name FROM information_schema.columns WHERE table_name = 'faqs'` includes `category_id`

### Task 0.3 — Seed database with 100+ meaningful records ✅
- **File**: `Phase_05/backend/scripts/seed_faqs.py`
- **What to create**:
  - **5 customer users** + **2 agent users** + **1 admin user** (all registered in AWS Cognito with real passwords)
  - **7 categories** (Payments, Listings, Safety, Disputes, Account, Delivery, General)
  - **20 FAQs** (2-4 per category, with category_id set, with embeddings via Bedrock)
  - **28+ forum topics** (4 per category; mix of Open/Answered/Locked statuses)
  - **40+ forum posts** (replies on topics, some marked is_accepted_answer=True)
  - **40+ AI query logs** (spread across 30 days, varied queries, mix of escalated/not)
- **Important**: Every ForumTopic and FAQ MUST have a non-null `embedding` vector (call `generate_embedding()`)
- **Demo accounts** (document in README):
  - `admin@osomba.com` / password → Cognito group: `Admins`
  - `agent@osomba.com` / password → Cognito group: `Agents`
  - `user@osomba.com` / password → no group (customer)
- **Verify**: After seeding, `SELECT count(*) FROM forum_topics` ≥ 28, `SELECT count(*) FROM faqs` ≥ 20

### Task 0.4 — Register demo users in AWS Cognito ✅
- Create the 8 users in Cognito User Pool with confirmed emails
- Add `admin@osomba.com` to Cognito group `Admins`
- Add `agent@osomba.com` and `agent2@osomba.com` to Cognito group `Agents`
- Set password for all: something memorable for thesis demo (e.g., `Osomba2026!`)
- **Verify**: Can log in from frontend with each account and see correct role in UI

---

## SECTION 1: HomePage (`/`) ✅ DONE

### Task 1.1 — Semantic search via `/support/search` works end-to-end ✅
- **Frontend file**: `Phase_05/frontend/src/pages/HomePage.tsx` (lines 90-122)
- **Backend file**: `Phase_05/backend/app/api/v1/endpoints/search.py`
- **Flow**: User types query → form submit → `GET /support/search?query=...` → Bedrock embedding → pgvector cosine search → results displayed
- **What to verify**:
  - Search "mpesa" returns FAQ results about M-Pesa payments
  - Search "delivery delayed" returns relevant topics
  - Empty query falls back to `fetchContent()` (all FAQs + topics)
  - Error state shows if API fails
- **Potential issue**: If Bedrock credentials not configured, `generate_embedding()` returns zero vector → no cosine matches → empty results
- **Fix if needed**: Ensure `.env` has `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` set correctly

### Task 1.2 — Category sidebar fetches from API ✅
- **File**: `Phase_05/frontend/src/components/Sidebar.tsx`
- **Flow**: On mount → `GET /support/categories/` → renders category buttons
- **What to verify**: Categories show with correct names and icons from DB
- **Verify**: Click a category → questions filter correctly (client-side filter on `q.category === selectedCategory`)
- **Potential issue**: Backend `ForumCategoryResponse` has `icon_url` mapped from emoji, but Sidebar expects `cat.icon_url`. Check schema returns the emoji.

### Task 1.3 — Question cards navigate correctly ✅
- **Verify**: Click FAQ card → navigates to `/faq/:id`
- **Verify**: Click Forum Post card → navigates to `/thread/:id`

---

## SECTION 2: AI Help Page (`/ai-help`) ✅ DONE

### Task 2.1 — AI suggest endpoint works ✅
- **Frontend**: `Phase_05/frontend/src/pages/AIHelpPage.tsx` (line 56)
- **Backend**: `Phase_05/backend/app/api/v1/endpoints/ai.py`
- **Flow**: User types query → `POST /support/ai/suggest` → Bedrock embedding → pgvector search on FAQ + ForumTopic tables → returns suggestions with confidence scores
- **What to verify**:
  - Query "how to pay with mpesa" returns FAQ match with high confidence
  - Query "random gibberish" returns fallback mock suggestion
  - Confidence stars display correctly (1-5 based on percentage)
  - Clicking a suggestion navigates to correct page (FAQ or thread)
- **Fix needed in ai.py**: The `faq.category` access — FAQ now has category_id FK and relationship, verify it loads properly with eager loading or joined query

### Task 2.2 — Escalate to forum works ✅
- **Flow**: User clicks "Ask the community" → `POST /support/ai/escalate` (sets log.escalated_to_forum=True) → redirect to `/post?q=<query>`
- **Verify**: Query text pre-fills in PostQuestion title field

### Task 2.3 — Example quick-ask buttons work ✅
- **Verify**: Click "How do I pay with MPESA?" → triggers AI search → shows results

---

## SECTION 3: Thread Detail Page (`/thread/:id`) ✅ DONE

### Task 3.1 — Topic loads with posts ✅
- **Frontend**: `Phase_05/frontend/src/pages/ThreadDetailPage.tsx`
- **Backend**: `GET /support/topics/:id` + `GET /support/topics/:id/posts`
- **Verify**: Title, content, author, category badge, view count all display
- **Verify**: Reply posts show in order with author info
- **Verify**: Accepted answer is highlighted

### Task 3.2 — Post a reply (authenticated user) ✅
- **Flow**: Type in reply box → submit → `POST /support/topics/:id/posts` → new post appears
- **Verify**: Must be logged in (redirect to login if not)
- **Verify**: Reply appears immediately after submission

### Task 3.3 — Mark official answer (agent/admin only) ✅
- **Flow**: Agent clicks "Mark as Official Answer" checkbox → `POST /support/topics/:id/official-answer` with `post_id`
- **OR**: Agent types in reply with "Official Answer" toggle → `POST /support/topics/:id/official-answer` with `content`
- **Verify**: Only visible to agents/admins
- **Verify**: Topic status changes from "Open" to "Answered"
- **Frontend bug check**: Line ~190 looks for `accepted_answer` but schema field is `is_accepted_answer` — verify this works

### Task 3.4 — Lock thread (agent/admin only) ✅
- **Flow**: Agent clicks lock button → `POST /support/topics/:id/lock` with `{is_locked: true}`
- **Verify**: Thread shows "Locked" status, reply box disappears

### Task 3.5 — Convert to FAQ (admin only) ✅
- **Flow**: Admin clicks "Convert to FAQ" on an accepted answer → `POST /support/topics/:id/convert-to-faq` with `{post_id, question}`
- **Verify**: New FAQ created, navigable from FAQ listing

### Task 3.6 — Related threads display ✅
- **Flow**: `GET /support/topics?limit=5` → shows in sidebar
- **Verify**: Clicking a related thread navigates to it

### Task 3.7 — Customer context panel (agent/admin only) ✅
- **Flow**: `GET /admin/users/:userId/support-context` → shows order history, past posts
- **Verify**: Only visible when agent/admin views a customer's thread
- **Potential issue**: If user has no orders in marketplace tables, some fields may error

### Task 3.8 — Replace alert() with toast notifications ✅
- **Lines**: ~130, ~141, ~162 use `alert()` for success/error
- **Fix**: Replace with a toast component or inline success message

---

## SECTION 4: FAQ Detail Page (`/faq/:id`) ✅ DONE

### Task 4.1 — FAQ loads with category info ✅
- **Frontend**: `Phase_05/frontend/src/pages/FAQPage.tsx`
- **Backend**: `GET /support/faq/:id`
- **Verify**: Question, answer, category badge, vote counts all display
- **Potential issue**: `FAQResponse` schema may not include `category` relationship data — check if `category.name_en` or `category.name` is returned

### Task 4.2 — Vote (helpful / not helpful) works ✅
- **Flow**: Click thumbs up → `POST /support/faq/:id/vote` with `{is_helpful: true}` → count increments
- **Verify**: Can only vote once (client-side lock via `helpful` state)
- **Verify**: Count updates in UI immediately

### Task 4.3 — Edit FAQ button needs an actual handler ✅
- **Problem**: Edit button exists but has NO onClick handler — does nothing
- **Fix**: Either add `onClick={() => navigate(\`/admin/faq/${faq.id}/edit\`)}` or remove the button if no edit page exists
- **Note**: Backend has `PUT /support/faq/:id` — could build inline edit modal

---

## SECTION 5: Post Question Page (`/post`) — Protected ✅ DONE

### Task 5.1 — Form submits and creates topic ✅
- **Frontend**: `Phase_05/frontend/src/pages/PostQuestionPage.tsx`
- **Backend**: `POST /support/topics`
- **Flow**: Select category → type title → type body → submit → topic created with embedding → redirect to `/thread/:id`
- **Verify**: Category dropdown populated from `GET /support/categories/`
- **Verify**: Validation works (title 10-200 chars, body 20-5000 chars)
- **Verify**: Success screen shows, redirects after 2 seconds

### Task 5.2 — Remove misleading "Step 1 of 2" progress bar ✅
- **Problem**: `step` state is hardcoded to 1, there is no step 2
- **Fix**: Remove the step indicator entirely, or just show a simple header

### Task 5.3 — Prefill from AI escalation works ✅
- **Verify**: Navigating to `/post?q=how+to+pay` pre-fills the title field

---

## SECTION 6: Login & Register Pages ✅ DONE

### Task 6.1 — Login with Cognito works ✅
- **Frontend**: `Phase_05/frontend/src/pages/LoginPage.tsx`
- **Flow**: Enter email + password → `loginUser()` (Cognito signIn) → `refreshSession()` (fetch user + role) → redirect
- **Verify**: Login as admin → redirected to `/`, sees Admin nav links
- **Verify**: Login as agent → sees Agent Dashboard link
- **Verify**: Login as customer → sees basic nav only
- **Verify**: Invalid credentials show error message

### Task 6.2 — Register with Cognito + email confirmation works ✅
- **Frontend**: `Phase_05/frontend/src/pages/RegisterPage.tsx`
- **Flow**: Enter name + email + password → `registerUser()` (Cognito signUp) → step 2: enter verification code → `confirmRegistration()` → redirect to `/login`
- **Verify**: Confirmation email sent by Cognito
- **Verify**: After confirmation, can log in
- **Verify**: JIT provisioning creates user row in DB on first login

### Task 6.3 — Verify `.env` has correct Cognito config ✅
- **Frontend .env**: `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`
- **Backend .env**: `COGNITO_USER_POOL_ID`, `COGNITO_APP_CLIENT_ID`
- Must match the same Cognito User Pool

---

## SECTION 7: Agent Dashboard (`/agent-dashboard`) — Protected (agent/admin) ✅ DONE

### Task 7.1 — Unanswered threads load and display ✅
- **Flow**: `GET /support/topics?limit=100` → filter where status !== "Answered" → table display
- **Verify**: Threads with accepted answers are excluded
- **Verify**: Urgent flag (red) shows for threads > 24 hours old

### Task 7.2 — Sorting works ✅
- **Verify**: "Newest first" / "Oldest first" / "Most views" all sort correctly (client-side)

### Task 7.3 — Category filter populated from API ✅
- **Verify**: Dropdown shows categories from `GET /support/categories/`

### Task 7.4 — Date filter dropdown is non-functional — fix or remove ✅
- **Problem**: Date filter dropdown (Last 7 days / Last 30 days / All time) changes state but NEVER filters data
- **Fix Option A**: Implement client-side date filtering on `created_at`
- **Fix Option B**: Remove the dropdown to avoid dead UI

### Task 7.5 — "More" menu button (MoreVertical) does nothing — fix or remove ✅
- **Problem**: Three-dot menu on each row has no handler
- **Fix**: Remove the button since we have no actions to put in it

### Task 7.6 — Click thread row navigates to detail page ✅
- **Verify**: Click any row → goes to `/thread/:id`

---

## SECTION 8: Admin Analytics Dashboard (`/admin/analytics`) — Protected (admin) ✅ DONE

### Task 8.1 — Overview stats load from API ✅
- **Flow**: `GET /admin/analytics/overview` → stats cards show total_posts, deflection_rate, avg_response_time, total_faqs
- **Problem**: `avg_response_time` is HARDCODED to "2h 45m" in backend
- **Fix Option A**: Compute from data (average time between topic creation and first accepted answer)
- **Fix Option B**: Remove the card or label it "N/A"

### Task 8.2 — Posts over time chart renders ✅
- **Flow**: `GET /admin/analytics/posts-over-time` → recharts line chart
- **Verify**: Chart shows data points with dates on x-axis
- **Requires**: Seed data with varied `created_at` dates (not all same date)

### Task 8.3 — Category distribution chart renders ✅
- **Flow**: `GET /admin/analytics/category-distribution` → recharts bar chart
- **Verify**: All 7 categories show with counts

### Task 8.4 — "Export Report" button does nothing — fix or remove ✅
- **Problem**: Button on line ~145 has no onClick handler
- **Fix Option A**: Implement CSV export of analytics data
- **Fix Option B**: Remove the button

---

## SECTION 9: Admin User Management (`/admin/users`) — Protected (admin) ✅ DONE

### Task 9.1 — User list loads ✅
### Task 9.2 — Search users works ✅
### Task 9.3 — Change user role works ✅

---

## SECTION 10: Admin Category Management (`/admin/categories`) — Protected (admin) ✅ DONE

### Task 10.1 — Category CRUD works ✅

---

## SECTION 11: Settings Page (`/settings`) — Protected ✅ DONE

### Task 11.1 — Profile loads from API ✅
### Task 11.2 — Save settings works ✅
### Task 11.3 — Removed email/push toggles (no backend support) ✅

---

## SECTION 12: Header & Navigation ✅ DONE

### Task 12.1 — Role-based nav links show correctly ✅
### Task 12.2 — FAB button now requires auth before navigating to /post ✅
### Task 12.3 — Language toggle works ✅

---

## SECTION 13: Cross-Cutting Concerns

### Task 13.1 — Ensure all `.env` variables are set
**Backend `.env`** must have:
```
POSTGRES_SERVER=<your-rds-endpoint>
POSTGRES_USER=<username>
POSTGRES_PASSWORD=<password>
POSTGRES_DB=<dbname>
POSTGRES_PORT=5432
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=<pool-id>
COGNITO_APP_CLIENT_ID=<client-id>
EMBEDDING_MODEL=amazon.titan-embed-text-v2:0
AI_SIMILARITY_THRESHOLD=0.5
```

**Frontend `.env`** must have:
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_COGNITO_USER_POOL_ID=<same-pool-id>
VITE_COGNITO_CLIENT_ID=<same-client-id>
```

### Task 13.2 — Run `vite build` with zero errors ✅
- `vite build` passes clean (only chunk size warning, not an error)

### Task 13.3 — Run backend without crashes ✅ (previously verified)

### Task 13.4 — Run seed script successfully ✅ (previously verified)

---

## Execution Order (Recommended)

1. **Task 0.1** → Fix config (1 min)
2. **Task 0.2** → Alembic migration (5 min)
3. **Task 0.4** → Register Cognito users (10 min, manual or CLI)
4. **Task 0.3** → Seed database (run script)
5. **Task 13.1** → Verify all .env vars
6. **Task 13.3** → Start backend, verify health
7. **Task 13.2** → Build frontend
8. **Tasks 1.x–12.x** → Test each page flow end-to-end, fix as encountered
9. **Task 5.2, 7.4, 7.5, 8.4, 11.3** → Remove dead UI elements
10. **Task 3.8** → Replace alerts with toasts (polish)

---

## Quick Reference: What Works vs What's Broken

| Feature | Status | Blocking Issue |
|---------|--------|----------------|
| Cognito Login/Register | ✅ Ready | Needs users in Cognito pool |
| Homepage listing | ✅ Ready | Needs seed data |
| Semantic search | ⚠️ Config needed | Missing `ai_similarity_threshold` in config |
| AI Help suggest | ✅ Ready | Needs Bedrock creds + seed data with embeddings |
| Post question | ✅ Ready | Needs auth |
| Thread detail + replies | ✅ Ready | Needs seed data |
| Official answer / lock | ✅ Ready | Needs agent account |
| Convert to FAQ | ✅ Ready | Needs admin account |
| FAQ page + voting | ✅ Ready | Needs seed FAQs |
| Agent dashboard | ⚠️ Dead UI | Date filter, More menu do nothing |
| Admin analytics | ⚠️ Hardcoded | avg_response_time is fake |
| Admin users | ✅ Ready | Needs seed users |
| Admin categories | ✅ Ready | Works |
| Settings | ⚠️ Partial | Email/push toggles don't persist |
| Export Report button | ❌ Broken | No handler |
| FAQ Edit button | ❌ Broken | No handler |
