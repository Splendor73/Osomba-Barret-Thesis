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
- No separate Phase_5. No copy-pasting. Work directly inside `osomba/backend/` and `osomba/lib/`.
- DB schema reference: `../Phase_1/02_Database_Schema.md`
- API spec reference: `../Phase_1/03_API_Endpoints.md`
- AI strategy reference: `../Phase_3/artifacts/01_AI_Strategy.md`
- FAQ seed data: `../Phase_3/artifacts/03_FAQ_Seeds.md`
- Figma UI reference: `../Phase_2/UI-UX/Figma_code/` (design reference only)

### BUILD PRIORITY (2-day timeline)

| Priority | What | Why |
|----------|------|-----|
| 🔴 P0 | Sections 0–8 (Backend + seed data) | Everything else depends on this |
| 🔴 P0 | Flutter: auth + forum + AI board screens | **Thesis core** — customer asks, AI answers or escalates |
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

- [x] `upstream` remote already added:
  ```bash
  # already done — verified:
  git remote -v
  # origin    https://github.com/Splendor73/Osomba-Barret-Thesis.git
  # upstream  https://github.com/hestonhamilton/osomba.git
  ```

- [ ] Delete old partial `Phase_5/` directory:
  ```bash
  rm -rf Phase_5/
  git add -A && git commit -m "chore: remove old Phase_5 partial files"
  ```

- [ ] Fork the ENTIRE main Osomba repo into `osomba/` — one command, one time:
  ```bash
  git subtree add --prefix=osomba upstream main --squash
  ```
  This creates `osomba/` with the full team codebase: `osomba/lib/` (Flutter) + `osomba/backend/` (FastAPI).
  `--squash` keeps main's commit history out of your thesis log.

- [ ] Push to GitHub:
  ```bash
  git push origin main
  ```

**Result after this step:**
```
Osomba-Barret-Thesis/
├── Phase_1/  Phase_2/  Phase_3/  Phase_4/   ← thesis docs
└── osomba/                                   ← full main Osomba repo, forked in
    ├── lib/                                  ← Flutter app — thesis screens go here
    ├── backend/                              ← FastAPI — thesis endpoints go here
    └── pubspec.yaml
```

---

### 0.2 What we add vs what already exists

The main backend already has: users, products, auctions, orders, payments, messages, notifications, reviews.
We add thesis-specific code on top — **no changes to existing files except 4 small edits**.

| File | EDIT or NEW | What |
|------|-------------|------|
| `osomba/backend/app/models/user.py` | **EDIT** | Add 4 thesis fields |
| `osomba/backend/app/core/config.py` | **EDIT** | Add thesis settings |
| `osomba/backend/app/core/security.py` | **EDIT** | Add bcrypt + JWT helpers |
| `osomba/backend/app/db/base.py` | **EDIT** | Add support model import |
| `osomba/backend/app/main.py` | **EDIT** | Add CORS + slowapi middleware |
| `osomba/backend/app/api/v1/api.py` | **EDIT** | Add thesis routers |
| `osomba/backend/requirements.txt` | **EDIT** | Add 6 thesis packages |
| `osomba/backend/app/models/support.py` | **NEW** | 7 thesis tables |
| `osomba/backend/app/schemas/support.py` | **NEW** | All thesis Pydantic schemas |
| `osomba/backend/app/crud/` | **NEW** | 5 CRUD files |
| `osomba/backend/app/services/` | **NEW** | 5 service files |
| `osomba/backend/app/api/v1/endpoints/` | **NEW** | 6 endpoint files |
| `osomba/backend/app/api/dependencies.py` | **NEW** | JWT auth dependencies |
| `osomba/backend/scripts/seed_faqs.py` | **NEW** | Seed script |
| `osomba/backend/alembic/versions/` | **NEW** | 1 migration (7 tables) |
| `osomba/lib/main.dart` | **EDIT** | Add thesis routes to GoRouter |
| `osomba/lib/services/api_service.dart` | **EDIT** | Add thesis API methods |
| `osomba/lib/services/auth_service.dart` | **EDIT** | Cognito → JWT |
| `osomba/lib/services/auth_interceptor.dart` | **EDIT** | Read from secure storage |
| `osomba/lib/providers/user_provider.dart` | **EDIT** | Add role field |
| `osomba/lib/screens/support/` | **NEW** | 9 customer + agent screens |
| `osomba/lib/screens/admin/` | **NEW** | 5 admin screens |
| `osomba/lib/screens/auth/forgot_password_screen.dart` | **NEW** | Forgot password |
| `osomba/lib/screens/auth/reset_password_screen.dart` | **NEW** | Reset password |
| `osomba/pubspec.yaml` | **EDIT** | Add fl_chart, flutter_secure_storage |

---

### 0.3 Syncing from main — one command forever

```bash
git subtree pull --prefix=osomba upstream main --squash
git push origin main
```

Git merges their changes with our additions. Since thesis code is in **new files**, conflicts are rare.
If `user.py` gets overwritten by a main team update, re-add the 4 thesis fields and run a new migration.

---

## FINAL FOLDER STRUCTURE

```
Osomba-Barret-Thesis/
├── Phase_1/  Phase_2/  Phase_3/  Phase_4/    ← thesis docs only
└── osomba/                                    ← full main repo + thesis additions
    │
    ├── backend/
    │   ├── app/
    │   │   ├── main.py                        ← EDIT
    │   │   ├── core/
    │   │   │   ├── config.py                  ← EDIT
    │   │   │   └── security.py                ← EDIT
    │   │   ├── db/
    │   │   │   ├── database.py                ← existing, unchanged
    │   │   │   └── base.py                    ← EDIT
    │   │   ├── models/
    │   │   │   ├── user.py                    ← EDIT (4 fields added)
    │   │   │   ├── product.py / auction.py / order.py / social.py  ← existing, unchanged
    │   │   │   └── support.py                 ← NEW
    │   │   ├── schemas/
    │   │   │   └── support.py                 ← NEW
    │   │   ├── crud/
    │   │   │   ├── user.py / forum.py / faq.py / ai_logs.py / category.py  ← NEW
    │   │   ├── services/
    │   │   │   ├── forum_service.py / faq_service.py / search_service.py   ← NEW
    │   │   │   ├── email_service.py / ai_service.py                        ← NEW
    │   │   └── api/
    │   │       ├── dependencies.py            ← NEW
    │   │       └── v1/
    │   │           ├── api.py                 ← EDIT
    │   │           └── endpoints/
    │   │               ├── auth.py / forum.py / faq.py   ← NEW
    │   │               ├── search.py / ai.py / admin.py  ← NEW
    │   │               └── categories.py                 ← NEW
    │   ├── alembic/versions/
    │   │   └── 00X_add_support_tables.py      ← NEW
    │   ├── scripts/
    │   │   └── seed_faqs.py                   ← NEW
    │   └── requirements.txt                   ← EDIT
    │
    ├── lib/
    │   ├── main.dart                          ← EDIT
    │   ├── services/
    │   │   ├── api_service.dart               ← EDIT
    │   │   ├── auth_service.dart              ← EDIT
    │   │   └── auth_interceptor.dart          ← EDIT
    │   ├── providers/user_provider.dart       ← EDIT
    │   └── screens/
    │       ├── support/                       ← NEW (9 screens)
    │       ├── admin/                         ← NEW (5 screens)
    │       └── auth/                          ← 2 screens edited + 2 new
    └── pubspec.yaml                           ← EDIT
```

---

## SECTION 1 — BACKEND SETUP

> `osomba/backend/` already exists from the fork. We edit existing files and add new ones.

### 1.1 Add thesis dependencies

- [ ] Open `osomba/backend/requirements.txt` and append these packages (keep all existing ones):
  ```
  # --- Thesis additions ---
  pgvector==0.3.5
  sentence-transformers==3.3.1
  sendgrid==6.11.0
  slowapi==0.1.9
  bleach==6.1.0
  python-jose[cryptography]==3.3.0
  passlib[bcrypt]==1.7.4
  ```
- [ ] In `osomba/backend/`, activate venv and install:
  ```bash
  pip install -r requirements.txt
  ```

### 1.2 Add thesis env vars

- [ ] Append these to `osomba/backend/.env` (file already exists from main project):
  ```
  # --- Thesis additions ---
  SECRET_KEY=your-super-secret-key-change-this
  ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=1440
  REFRESH_TOKEN_EXPIRE_DAYS=30
  SENDGRID_API_KEY=SG.xxxxxxxx
  FROM_EMAIL=support@osomba.com
  FRONTEND_URL=http://localhost:8000
  EMBEDDING_MODEL=all-MiniLM-L6-v2
  SIMILARITY_THRESHOLD=0.6
  CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001
  ```
- [ ] Add these same keys to `.env.example` (safe to commit — no real values)

### 1.3 Enable pgvector extension

- [ ] Run this SQL against the PostgreSQL database (same DB the main app uses):
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  ```

### 1.4 Edit `osomba/backend/app/core/config.py`

- [ ] Add these thesis fields to the existing `Settings` class:
  ```python
  secret_key: str = ""
  algorithm: str = "HS256"
  access_token_expire_minutes: int = 1440
  refresh_token_expire_days: int = 30
  sendgrid_api_key: str = ""
  from_email: str = "support@osomba.com"
  frontend_url: str = "http://localhost:8000"
  embedding_model: str = "all-MiniLM-L6-v2"
  similarity_threshold: float = 0.6
  cors_origins: str = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"
  ```

### 1.5 Edit `osomba/backend/app/core/security.py`

- [ ] Add these thesis auth helpers to the existing file:
  ```python
  from passlib.context import CryptContext
  from jose import JWTError, jwt
  from datetime import datetime, timedelta
  from fastapi import HTTPException, status

  pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

  def hash_password(password: str) -> str:
      return pwd_context.hash(password)

  def verify_password(plain: str, hashed: str) -> bool:
      return pwd_context.verify(plain, hashed)

  def create_access_token(data: dict) -> str:
      expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
      return jwt.encode({**data, "exp": expire}, settings.secret_key, algorithm=settings.algorithm)

  def create_refresh_token(data: dict) -> str:
      expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
      return jwt.encode({**data, "exp": expire, "type": "refresh"}, settings.secret_key, algorithm=settings.algorithm)

  def decode_token(token: str) -> dict:
      try:
          return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
      except JWTError:
          raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
  ```

### 1.6 Edit `osomba/backend/app/db/base.py`

- [ ] Add the support model import so Alembic sees the thesis tables:
  ```python
  from app.models import support  # noqa — thesis support tables
  ```

### 1.7 Edit `osomba/backend/app/main.py`

- [ ] Add CORS middleware reading from settings (environment-driven):
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  from app.core.config import settings

  app.add_middleware(
      CORSMiddleware,
      allow_origins=settings.cors_origins.split(","),
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- [ ] Add slowapi rate limiter middleware:
  ```python
  from slowapi import Limiter, _rate_limit_exceeded_handler
  from slowapi.util import get_remote_address
  from slowapi.errors import RateLimitExceeded

  limiter = Limiter(key_func=get_remote_address)
  app.state.limiter = limiter
  app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
  ```
- [ ] Add `GET /health` endpoint returning `{"status": "ok"}`
- [ ] Add startup event to warm up the embedding model:
  ```python
  @app.on_event("startup")
  async def startup_event():
      from app.services.ai_service import get_model
      get_model()  # load model into memory on startup
  ```

---

## SECTION 2 — DATABASE MODELS

### 2.1 Edit `osomba/backend/app/models/user.py` — add 4 thesis fields

- [ ] Open the existing User model and add these 4 fields (nullable so existing Cognito users are unaffected):
  ```python
  from typing import Optional
  from sqlalchemy import Boolean, DateTime
  from sqlalchemy.orm import Mapped, mapped_column

  # Add inside the User class:
  password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
  email_notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
  password_reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
  password_reset_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
  ```

### 2.2 Create `osomba/backend/app/models/support.py` — 7 thesis tables

- [ ] Create this new file with ONLY the 7 thesis-specific tables:

  **SupportCategory**
  - `id`: Integer PK autoincrement
  - `name_en`: String(100), not null
  - `name_fr`: String(100), nullable
  - `slug`: String(100), unique, not null, indexed
  - `icon`: String(50), nullable
  - `display_order`: Integer, default 0
  - `is_active`: Boolean, default True
  - `created_at`: DateTime, default now()

  **ForumPost**
  - `id`: UUID PK (default uuid4)
  - `user_id`: UUID, FK → users.id CASCADE, not null, indexed
  - `category_id`: Integer, FK → support_categories.id, not null, indexed
  - `title`: String(200), not null
  - `body`: Text, not null
  - `language`: Enum('en','fr'), default 'en'
  - `status`: Enum('open','answered','locked','closed'), default 'open', indexed
  - `view_count`: Integer, default 0
  - `helpful_count`: Integer, default 0
  - `created_at`: DateTime, default now(), indexed desc
  - `updated_at`: DateTime, default now(), onupdate now()
  - Relationships: `author` → User, `category` → SupportCategory, `official_answer` → OfficialAnswer

  **OfficialAnswer**
  - `id`: UUID PK (default uuid4)
  - `forum_post_id`: UUID, FK → forum_posts.id CASCADE, UNIQUE, not null
  - `agent_id`: UUID, FK → users.id, not null
  - `answer_text`: Text, not null
  - `is_converted_to_faq`: Boolean, default False
  - `created_at`: DateTime, default now()
  - `updated_at`: DateTime, default now(), onupdate now()
  - Relationships: `forum_post` → ForumPost, `agent` → User

  **FaqArticle**
  - `id`: UUID PK (default uuid4)
  - `agent_id`: UUID, FK → users.id, not null
  - `category_id`: Integer, FK → support_categories.id, not null, indexed
  - `title`: String(200), not null
  - `body`: Text, not null
  - `language`: Enum('en','fr'), default 'en', indexed
  - `status`: Enum('draft','published','archived'), default 'draft', indexed
  - `source_forum_post_id`: UUID, FK → forum_posts.id SET NULL, nullable
  - `view_count`: Integer, default 0
  - `helpful_count`: Integer, default 0
  - `created_at`: DateTime, default now(), indexed desc
  - `updated_at`: DateTime, default now(), onupdate now()
  - Relationships: `author` → User, `category` → SupportCategory

  **ContentEmbedding**
  - `id`: UUID PK (default uuid4)
  - `source_type`: Enum('faq','forum'), not null, indexed
  - `source_id`: UUID, not null, indexed
  - `embedding`: Vector(384) — import from `pgvector.sqlalchemy`
  - `metadata_json`: JSON, nullable (stores category_id, language, title snippet)
  - `created_at`: DateTime, default now()
  - Composite index on (source_type, source_id)
  - **HNSW vector index** (works at any dataset size — IVFFlat requires thousands of rows):
    ```python
    Index('idx_embedding_hnsw', ContentEmbedding.embedding,
          postgresql_using='hnsw',
          postgresql_with={'m': 16, 'ef_construction': 64})
    ```
  - Note: With only 20 seed FAQs, PostgreSQL will seq scan regardless — HNSW activates as data grows.

  **AiQueryLog**
  - `id`: UUID PK (default uuid4)
  - `user_id`: UUID, FK → users.id SET NULL, nullable, indexed
  - `query_text`: Text, not null
  - `language`: Enum('en','fr'), default 'en'
  - `results_returned`: Integer, default 0
  - `top_result_id`: String(100), nullable
  - `top_result_type`: Enum('faq','forum'), nullable
  - `top_result_score`: Float, nullable
  - `escalated_to_forum`: Boolean, default False, indexed
  - `created_forum_post_id`: UUID, FK → forum_posts.id SET NULL, nullable
  - `session_id`: String(100), nullable, indexed
  - `created_at`: DateTime, default now(), indexed desc

  **UserSession**
  - `id`: UUID PK (default uuid4)
  - `user_id`: UUID, FK → users.id CASCADE, not null, indexed
  - `refresh_token`: String(500), unique, not null
  - `expires_at`: DateTime, not null
  - `created_at`: DateTime, default now()

### 2.3 New Alembic migration — add thesis support tables

- [ ] Verify `osomba/backend/alembic/env.py` imports the support model:
  ```python
  from app.models import support  # noqa
  ```
- [ ] Generate the migration:
  ```bash
  cd osomba/backend
  alembic revision --autogenerate -m "add_support_tables"
  ```
- [ ] Review the generated file — it should create ONLY the 7 thesis tables (existing tables already in DB)
- [ ] Add pgvector extension lines at the top of the migration `upgrade()`:
  ```python
  op.execute("CREATE EXTENSION IF NOT EXISTS vector")
  op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
  ```
- [ ] Run the migration:
  ```bash
  alembic upgrade head
  ```
- [ ] Verify: `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;`
  Should show: `support_categories`, `forum_posts`, `official_answers`, `faq_articles`, `content_embeddings`, `ai_query_logs`, `user_sessions` — plus all existing main Osomba tables.

---

## SECTION 3 — PYDANTIC SCHEMAS

- [ ] Create `osomba/backend/app/schemas/support.py` with all thesis schemas:

  **Auth schemas**
  - `UserRegister`: email (EmailStr), password (min 8), name (str), language_preference (default 'en')
  - `UserLogin`: email, password
  - `TokenResponse`: access_token, refresh_token, token_type='bearer', user (UserOut)
  - `UserOut`: id, email, name, role, language_preference, created_at — `model_config = ConfigDict(from_attributes=True)`
  - `UserProfileUpdate`: name (optional), language_preference (optional), email_notifications_enabled (optional)

  **Category schemas**
  - `CategoryOut`: id, name_en, name_fr, slug, icon, display_order — from_attributes=True

  **Forum schemas**
  - `ForumPostCreate`: title (min 10, max 200), body (min 20, max 5000), category_id (int), language (default 'en')
  - `ForumPostOut`: id, title, body, author (UserOut), category (CategoryOut), status, language, view_count, helpful_count, has_official_answer (bool computed), created_at, updated_at — from_attributes=True
  - `ForumPostDetail`: extends ForumPostOut + official_answer (OfficialAnswerOut or None)
  - `ForumStatusUpdate`: status — Literal['locked', 'closed']
  - `PaginatedForumPosts`: posts (list[ForumPostOut]), total, page, per_page, total_pages

  **Official Answer schemas**
  - `OfficialAnswerCreate`: answer_text (min 10)
  - `OfficialAnswerOut`: id, forum_post_id, answer_text, agent (UserOut), is_converted_to_faq, created_at — from_attributes=True

  **FAQ schemas**
  - `FaqArticleCreate`: title (min 10, max 200), body (min 20), category_id, language (default 'en'), status (default 'draft')
  - `FaqArticleUpdate`: title, body, category_id, status — all Optional
  - `FaqArticleOut`: id, title, body, category (CategoryOut), language, status, view_count, helpful_count, author (UserOut), source_forum_post_id, created_at, updated_at — from_attributes=True
  - `PaginatedFaqArticles`: articles (list[FaqArticleOut]), total, page, per_page, total_pages

  **Search schemas**
  - `SearchResult`: type ('faq' or 'forum'), id (str), title, snippet (str, 200 chars), category (CategoryOut), relevance_score (float), created_at
  - `SearchResponse`: results (list[SearchResult]), query, total_results

  **AI schemas**
  - `AiSuggestRequest`: query (min 10), language (default 'en'), session_id (optional str)
  - `AiSuggestion`: type, id, title, snippet, category_name (str), similarity_score (float), url (str)
  - `AiSuggestResponse`: suggestions (list[AiSuggestion]), suggested_action (Literal['review_results','post_to_forum']), escalation_available (bool), message (optional str)
  - `AiEscalateRequest`: query_log_id (UUID), title, body, category_id (int)

  **Admin schemas**
  - `AgentCreate`: email (EmailStr)
  - `AgentOut`: id, email, name, role, created_at — from_attributes=True
  - `AnalyticsResponse`: forum_stats (dict), faq_stats (dict), ai_stats (dict), top_categories (list)

---

## SECTION 4 — CRUD LAYER

### 4.1 `osomba/backend/app/crud/user.py`

- [ ] Create with these functions:
  - `get_by_email(db, email) -> User | None`
  - `get_by_id(db, user_id) -> User | None`
  - `create_user(db, email, password, name, language) -> User` — calls `hash_password()`
  - `update_profile(db, user_id, name, lang, email_notifs) -> User`
  - `get_all_agents(db) -> list[User]`
  - `promote_to_agent(db, email) -> User` — raises 404 if not found
  - `demote_to_customer(db, user_id) -> User`
  - `save_refresh_token(db, user_id, token, expires_at)`
  - `get_by_refresh_token(db, token) -> UserSession | None`
  - `delete_refresh_token(db, token)`
  - `set_password_reset_token(db, user_id, token, expires_at)`
  - `get_by_reset_token(db, token) -> User | None` — returns None if expired
  - `complete_password_reset(db, user_id, new_password)` — hashes and saves, clears token

### 4.2 `osomba/backend/app/crud/forum.py`

- [ ] Create with:
  - `create_post(db, user_id, category_id, title, body, language) -> ForumPost`
  - `get_post(db, post_id) -> ForumPost | None`
  - `get_posts(db, category_id, status, language, page, limit) -> tuple[list[ForumPost], int]` — paginated, newest first
  - `increment_view_count(db, post_id)`
  - `increment_helpful_count(db, post_id)`
  - `update_status(db, post_id, status) -> ForumPost`
  - `create_official_answer(db, post_id, agent_id, answer_text) -> OfficialAnswer` — also sets post.status='answered'
  - `get_official_answer(db, post_id) -> OfficialAnswer | None`
  - `mark_answer_converted(db, answer_id)`

### 4.3 `osomba/backend/app/crud/faq.py`

- [ ] Create with:
  - `create_article(db, agent_id, category_id, title, body, language, status, source_post_id=None) -> FaqArticle`
  - `get_article(db, article_id) -> FaqArticle | None`
  - `get_articles(db, category_id, language, status, page, limit) -> tuple[list[FaqArticle], int]`
  - `update_article(db, article_id, **fields) -> FaqArticle`
  - `increment_view_count(db, article_id)`
  - `increment_helpful_count(db, article_id)`
  - `archive_article(db, article_id)` — sets status='archived'

### 4.4 `osomba/backend/app/crud/ai_logs.py`

- [ ] Create with:
  - `create_log(db, user_id, query_text, language, session_id) -> AiQueryLog`
  - `update_log_results(db, log_id, results_returned, top_result_id, top_result_type, top_result_score)`
  - `mark_escalated(db, log_id, forum_post_id)`
  - `get_analytics(db, start_date, end_date) -> dict`
  - `get_top_queries(db, limit=10) -> list[dict]`

### 4.5 `osomba/backend/app/crud/category.py`

- [ ] Create with:
  - `get_all(db) -> list[SupportCategory]` — only active, ordered by display_order
  - `get_by_slug(db, slug) -> SupportCategory | None`
  - `create(db, name_en, name_fr, slug, icon, display_order) -> SupportCategory`
  - `update(db, category_id, **fields) -> SupportCategory`
  - `archive(db, category_id)` — sets is_active=False

---

## SECTION 5 — SERVICES LAYER

### 5.1 `osomba/backend/app/services/forum_service.py`

- [ ] Create:
  - `create_post(db, current_user, data: ForumPostCreate) -> ForumPost`
    - Validates category exists and is_active
    - Calls `crud.forum.create_post()`
    - Fire-and-forget: `email_service.send_new_post_notification()` (in try/except)
  - `get_post_detail(db, post_id) -> ForumPost`
    - Raises 404 if not found
    - Calls `crud.forum.increment_view_count()`
  - `async add_official_answer(db, post_id, agent_user, answer_text) -> OfficialAnswer`
    - Validates post exists and status='open' (raise 400 if not)
    - Validates no existing answer (raise 409 if exists)
    - Calls `crud.forum.create_official_answer()`
    - Awaits `ai_service.embed_forum_thread()` — stores embedding for AI search
    - Fire-and-forget: `email_service.send_official_answer_notification()`
  - `update_status(db, post_id, agent_user, status) -> ForumPost`
    - Validates post exists
    - Calls `crud.forum.update_status()`

### 5.2 `osomba/backend/app/services/faq_service.py`

- [ ] Create:
  - `async create_article(db, agent_user, data: FaqArticleCreate) -> FaqArticle`
    - Calls `crud.faq.create_article()`
    - If status='published': awaits `ai_service.embed_faq()`
  - `async convert_from_forum(db, post_id, agent_user) -> FaqArticle`
    - Validates post has official answer (raise 400 if not)
    - Validates not already converted (raise 409 if is_converted_to_faq=True)
    - Creates FaqArticle: title=post.title, body=answer.answer_text, category=post.category, language=post.language, status='draft'
    - Calls `crud.faq.mark_answer_converted()`
  - `async publish_article(db, article_id, agent_user) -> FaqArticle`
    - Sets status='published'
    - Awaits `ai_service.embed_faq()` — stores embedding
  - `async update_article(db, article_id, agent_user, data: FaqArticleUpdate) -> FaqArticle`
    - If status changing to 'published': awaits `ai_service.embed_faq()`

### 5.3 `osomba/backend/app/services/search_service.py`

- [ ] Create:
  - `unified_search(db, query, type_filter, category_id, language, limit) -> SearchResponse`
    - Language-aware: `lang_config = 'french' if language == 'fr' else 'english'`
    - PostgreSQL full-text search using `to_tsvector` + `plainto_tsquery`
    - Searches: forum_posts (status IN answered/locked/closed) + faq_articles (status=published)
    - UNION results sorted by ts_rank DESC then created_at DESC
    - Apply type_filter ('forum', 'faq', or 'all') if provided
    - Returns SearchResponse with labeled results

### 5.4 `osomba/backend/app/services/email_service.py`

- [ ] Create — all functions fire-and-forget (wrapped in try/except — email failure never breaks main flow):
  - `send_official_answer_notification(customer_email, customer_name, post_title, post_id, answer_snippet)`
    - Only sends if `user.email_notifications_enabled = True`
    - Subject: "Your question has been answered on Osomba Support"
  - `send_new_post_notification(agent_emails, post_title, post_category, post_url)`
    - Subject: "New unanswered question: {post_title}"
  - `send_password_reset_email(email, reset_token)`
    - Reset link: `{settings.frontend_url}/reset-password?token={reset_token}`
    - Subject: "Reset your Osomba Support password"

### 5.5 `osomba/backend/app/services/ai_service.py` — CORE FEATURE

- [ ] Create:

  ```python
  from sentence_transformers import SentenceTransformer
  from fastapi.concurrency import run_in_threadpool

  _model = None

  def get_model():
      global _model
      if _model is None:
          _model = SentenceTransformer(settings.embedding_model)
      return _model

  def _encode_sync(text: str) -> list[float]:
      """CPU-bound — never call directly from async context."""
      return get_model().encode(text).tolist()
  ```

  - `async generate_embedding(text: str) -> list[float]`
    - Uses `run_in_threadpool` so the event loop is never blocked:
      ```python
      async def generate_embedding(text: str) -> list[float]:
          return await run_in_threadpool(_encode_sync, text)
      ```
    - Returns 384-dim vector (all-MiniLM-L6-v2)

  - `async embed_faq(db, faq_article) -> ContentEmbedding`
    - Text: `faq_article.title + " " + faq_article.body`
    - Upserts into content_embeddings: source_type='faq', source_id=faq_article.id, embedding=vector
    - metadata_json = {category_id, language, title: first 100 chars}

  - `async embed_forum_thread(db, forum_post, official_answer) -> ContentEmbedding`
    - Text: `forum_post.title + " " + official_answer.answer_text`
    - Upserts: source_type='forum', source_id=forum_post.id

  - `async get_suggestions(db, query_text, language, user_id, session_id) -> AiSuggestResponse`
    - Creates AiQueryLog entry
    - Awaits `generate_embedding(query_text)`
    - Runs pgvector cosine similarity search:
      ```sql
      SELECT source_type, source_id,
             1 - (embedding <=> :query_vec) AS similarity
      FROM content_embeddings
      WHERE metadata_json->>'language' = :language
      ORDER BY embedding <=> :query_vec
      LIMIT 10
      ```
    - Filters results: similarity >= settings.similarity_threshold (0.6)
    - Fetches full FAQ article or forum post for each result
    - Builds AiSuggestion list with title, snippet, score, source badge, URL
    - Updates AiQueryLog with results
    - If 0 results above threshold: suggested_action='post_to_forum'
    - Returns AiSuggestResponse

  - `async escalate_to_forum(db, current_user, request: AiEscalateRequest) -> ForumPost`
    - Creates forum post from escalation data
    - Updates AiQueryLog: escalated_to_forum=True, created_forum_post_id=new_post.id

---

## SECTION 6 — API ENDPOINTS

### 6.1 `osomba/backend/app/api/dependencies.py`

- [ ] Create:
  ```python
  from typing import Annotated, Optional
  from fastapi import Depends, HTTPException, status
  from fastapi.security import OAuth2PasswordBearer
  from sqlalchemy.orm import Session

  oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login", auto_error=False)

  SessionDep = Annotated[Session, Depends(get_db)]

  async def get_current_user(token: str = Depends(oauth2_scheme), db: SessionDep = ...) -> User:
      if not token:
          raise HTTPException(status_code=401, detail="Not authenticated")
      payload = decode_token(token)
      user = crud.user.get_by_id(db, payload["sub"])
      if not user:
          raise HTTPException(status_code=404, detail="User not found")
      return user

  async def get_optional_user(token: Optional[str] = Depends(oauth2_scheme), db: SessionDep = ...) -> Optional[User]:
      if not token:
          return None
      try:
          payload = decode_token(token)
          return crud.user.get_by_id(db, payload["sub"])
      except Exception:
          return None

  def require_agent(current_user: User = Depends(get_current_user)) -> User:
      if current_user.role not in ('agent', 'admin'):
          raise HTTPException(status_code=403, detail="Agent or Admin access required")
      return current_user

  def require_admin(current_user: User = Depends(get_current_user)) -> User:
      if current_user.role != 'admin':
          raise HTTPException(status_code=403, detail="Admin access required")
      return current_user

  CurrentUserDep = Annotated[User, Depends(get_current_user)]
  OptionalUserDep = Annotated[Optional[User], Depends(get_optional_user)]
  AgentDep = Annotated[User, Depends(require_agent)]
  AdminDep = Annotated[User, Depends(require_admin)]
  ```

### 6.2 `osomba/backend/app/api/v1/endpoints/auth.py`

- [ ] Implement:
  - `POST /auth/register` — public → UserRegister → 201 + TokenResponse
  - `POST /auth/login` — public → UserLogin → TokenResponse + save refresh token
  - `POST /auth/refresh` — public → `{refresh_token}` → `{access_token, expires_in}`
  - `POST /auth/logout` — CurrentUserDep → delete refresh token → 200
  - `GET /auth/me` — CurrentUserDep → UserOut
  - `POST /auth/forgot-password` — public → `{email}` → generate token, email link → always return 200 (don't leak email existence)
  - `POST /auth/reset-password` — public → `{token, new_password}` → validate, hash, clear token
  - `PUT /users/profile` — CurrentUserDep + UserProfileUpdate → updated UserOut

### 6.3 `osomba/backend/app/api/v1/endpoints/forum.py`

- [ ] Implement:
  - `GET /forum/posts` — public → query params: category_id, status, language, page, limit → PaginatedForumPosts
  - `POST /forum/posts` — CurrentUserDep → ForumPostCreate → 201 + ForumPostOut
  - `GET /forum/posts/{post_id}` — public → ForumPostDetail (increments view_count)
  - `PATCH /forum/posts/{post_id}/status` — AgentDep → ForumStatusUpdate → ForumPostOut
  - `POST /forum/posts/{post_id}/official-answer` — AgentDep → OfficialAnswerCreate → 201 + OfficialAnswerOut (also embeds thread)
  - `POST /forum/posts/{post_id}/helpful` — CurrentUserDep → increments helpful_count → `{helpful_count: int}`

### 6.4 `osomba/backend/app/api/v1/endpoints/faq.py`

- [ ] Implement:
  - `GET /faq/articles` — public (non-agents only see published) → PaginatedFaqArticles
  - `POST /faq/articles` — AgentDep → FaqArticleCreate → 201 + FaqArticleOut
  - `GET /faq/articles/{article_id}` — public → FaqArticleOut (increments view_count)
  - `PUT /faq/articles/{article_id}` — AgentDep → FaqArticleUpdate → FaqArticleOut
  - `DELETE /faq/articles/{article_id}` — AgentDep → soft delete (status=archived) → 204
  - `POST /faq/articles/{article_id}/helpful` — CurrentUserDep → `{helpful_count: int}`
  - `POST /faq/convert-from-forum/{post_id}` — AgentDep → creates draft FAQ from forum answer → 201 + FaqArticleOut

### 6.5 `osomba/backend/app/api/v1/endpoints/search.py`

- [ ] Implement:
  - `GET /search` — public → query params: q (required), type, category_id, language, limit → SearchResponse

### 6.6 `osomba/backend/app/api/v1/endpoints/ai.py`

- [ ] Implement:
  - `POST /ai/suggest` — OptionalUserDep → AiSuggestRequest → AiSuggestResponse
  - `POST /ai/escalate` — CurrentUserDep → AiEscalateRequest → 201 + ForumPostOut

### 6.7 `osomba/backend/app/api/v1/endpoints/admin.py`

- [ ] Implement:
  - `GET /admin/agents` — AdminDep → list[AgentOut]
  - `POST /admin/agents` — AdminDep → AgentCreate → AgentOut
  - `DELETE /admin/agents/{user_id}` — AdminDep → 204
  - `GET /admin/analytics` — AdminDep → query params: start_date, end_date, format ('json' or 'csv') → AnalyticsResponse or StreamingResponse (CSV for FR-8.2)
  - `GET /admin/forum/posts` — AdminDep → all posts paginated
  - `GET /admin/users` — AdminDep → all users paginated

### 6.8 `osomba/backend/app/api/v1/endpoints/categories.py`

- [ ] Implement:
  - `GET /categories` — public → list[CategoryOut]
  - `POST /categories` — AdminDep → create category
  - `PUT /categories/{category_id}` — AdminDep → update
  - `DELETE /categories/{category_id}` — AdminDep → archive

### 6.9 Edit `osomba/backend/app/api/v1/api.py` — add thesis routers

- [ ] Add thesis routers to the existing api_router:
  ```python
  from .endpoints import auth, forum, faq, search, ai, admin, categories

  api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
  api_router.include_router(forum.router, prefix="/forum", tags=["forum"])
  api_router.include_router(faq.router, prefix="/faq", tags=["faq"])
  api_router.include_router(search.router, tags=["search"])
  api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
  api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
  api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
  ```

---

## SECTION 7 — SEED DATA

- [ ] Create `osomba/backend/scripts/seed_faqs.py`:

  **Script does:**
  1. Connect to DB using DATABASE_URL
  2. Create 3 users (skip if already exists):
     - `admin@osomba.com` / `Admin123!` / role='admin'
     - `agent@osomba.com` / `Agent123!` / role='agent'
     - `customer@osomba.com` / `Customer123!` / role='customer'
  3. Create 7 SupportCategories: Payments, Listings, Safety, Disputes, Account, Delivery, Other
  4. Insert all 20 FAQ articles from `../Phase_3/artifacts/03_FAQ_Seeds.md` — status='published', agent_id=agent user
  5. Generate embeddings for all 20 FAQs using `ai_service.generate_embedding()` and store in content_embeddings
  6. Print "Seed complete: 3 users, 7 categories, 20 FAQs, 20 embeddings"

- [ ] Run:
  ```bash
  cd osomba/backend
  python scripts/seed_faqs.py
  ```
- [ ] Verify: `SELECT COUNT(*) FROM content_embeddings;` → 20
- [ ] Verify: `SELECT COUNT(*) FROM faq_articles;` → 20
- [ ] Verify: `SELECT COUNT(*) FROM support_categories;` → 7

---

## SECTION 8 — BACKEND VERIFICATION

- [ ] Run:
  ```bash
  cd osomba/backend
  uvicorn app.main:app --reload --port 8000
  ```
- [ ] Open `http://localhost:8000/docs` — Swagger UI shows all endpoints including thesis ones
- [ ] Test auth:
  - `POST /v1/auth/login` → `{"email": "admin@osomba.com", "password": "Admin123!"}` → get token
  - `GET /v1/auth/me` with Bearer token → see admin user with role='admin'
- [ ] Test forum:
  - `POST /v1/forum/posts` (as customer) → create post → 201
  - `GET /v1/forum/posts` → see the post
- [ ] Test AI:
  - `POST /v1/ai/suggest` → `{"query": "how do I pay with MPESA?", "language": "en"}` → returns suggestions with scores
- [ ] Test search:
  - `GET /v1/search?q=mpesa` → returns FAQ + forum results
- [ ] Test agent flow:
  - Login as agent → `POST /v1/forum/posts/{id}/official-answer` → 201 + embedding created
  - `POST /v1/faq/convert-from-forum/{post_id}` → draft FAQ created
- [ ] Verify 403 for wrong roles:
  - Customer tries `POST /v1/forum/posts/{id}/official-answer` → 403
  - Agent tries `GET /v1/admin/analytics` → 403

- [ ] **Commit and push:**
  ```bash
  git add osomba/backend/ && git commit -m "feat: add support forum backend with AI pipeline"
  git push origin main
  ```

---

## SECTION 9 — FLUTTER APP

> Work directly in `osomba/` — the Flutter app is already there from the fork.
> We edit existing files and create new screens in `osomba/lib/screens/support/` and `osomba/lib/screens/admin/`.

### 9.1 Add Flutter dependencies

- [ ] Open `osomba/pubspec.yaml` and add (if not already present):
  ```yaml
  dependencies:
    flutter_secure_storage: ^9.0.0   # JWT token storage
    fl_chart: ^0.68.0                 # admin analytics charts
  ```
  (dio, provider, go_router are already in the main pubspec)
- [ ] Run `flutter pub get`

### 9.2 Update `osomba/lib/services/auth_service.dart` — Cognito → JWT

- [ ] Replace Cognito `signIn`/`signUp` calls with calls to thesis JWT backend:
  - `login(email, password)` → `POST /v1/auth/login` → store access + refresh token in `FlutterSecureStorage`
  - `register(email, password, name, lang)` → `POST /v1/auth/register` → store tokens
  - `logout()` → `POST /v1/auth/logout` → clear tokens from secure storage
  - `getMe()` → `GET /v1/auth/me` → returns current user
  - `forgotPassword(email)` → `POST /v1/auth/forgot-password`
  - `resetPassword(token, newPassword)` → `POST /v1/auth/reset-password`
- [ ] Expose `currentUser` (cached UserOut), `isAuthenticated`, `userRole` getters

### 9.3 Update `osomba/lib/services/auth_interceptor.dart`

- [ ] Read JWT access token from `FlutterSecureStorage` on every request
- [ ] Attach as `Authorization: Bearer {token}` header
- [ ] On 401: call `POST /v1/auth/refresh` with stored refresh token → update access token → retry once

### 9.4 Update `osomba/lib/providers/user_provider.dart`

- [ ] Add `role` field to `UserModel` ('customer', 'agent', 'admin')
- [ ] Add `isAgent` getter: `role == 'agent' || role == 'admin'`
- [ ] Add `isAdmin` getter: `role == 'admin'`

### 9.5 Update `osomba/lib/services/api_service.dart` — add thesis endpoints

- [ ] Add these methods to the existing Dio-based ApiService:

  **Forum:**
  - `getForumPosts({int? categoryId, String? status, String? language, int page = 1})`
  - `getForumPost(String postId)`
  - `createForumPost(String title, String body, int categoryId, String lang)`
  - `addOfficialAnswer(String postId, String answerText)`
  - `updateForumStatus(String postId, String status)`
  - `convertPostToFaq(String postId)`
  - `markForumHelpful(String postId)`

  **FAQ:**
  - `getFaqArticles({int? categoryId, String? language, String? status, int page = 1})`
  - `getFaqArticle(String articleId)`
  - `createFaqArticle(Map<String, dynamic> data)`
  - `updateFaqArticle(String articleId, Map<String, dynamic> data)`
  - `markFaqHelpful(String articleId)`

  **Search + AI:**
  - `search(String q, {String? type, int? categoryId, String? language})`
  - `aiSuggest(String query, String language, String sessionId)`
  - `aiEscalate(String queryLogId, String title, String body, int categoryId)`

  **Categories + Admin:**
  - `getCategories()`
  - `getAdminAgents()`, `addAdminAgent(String email)`, `removeAdminAgent(String userId)`
  - `getAdminAnalytics({String? startDate, String? endDate})`
  - `getAdminAllPosts({String? status, int? categoryId, int page = 1})`
  - `getAdminAllFaqs({String? status, int? categoryId, int page = 1})`

### 9.6 Update `osomba/lib/main.dart` — add thesis routes

- [ ] Add all thesis routes to the existing GoRouter while keeping all existing marketplace routes:
  ```dart
  // Support Forum
  GoRoute(path: '/support', builder: (_, __) => const SupportHomeScreen()),
  GoRoute(path: '/support/forum', builder: (_, __) => const ForumListScreen()),
  GoRoute(path: '/support/forum/new', builder: (_, __) => const PostQuestionScreen()),
  GoRoute(path: '/support/forum/:id', builder: (_, s) => ForumThreadScreen(postId: s.pathParameters['id']!)),
  GoRoute(path: '/support/faq', builder: (_, __) => const FaqListScreen()),
  GoRoute(path: '/support/faq/:id', builder: (_, s) => FaqArticleScreen(articleId: s.pathParameters['id']!)),
  GoRoute(path: '/support/ai', builder: (_, __) => const AiHelpBoardScreen()),
  GoRoute(path: '/support/my-questions', builder: (_, __) => const MyQuestionsScreen()),
  GoRoute(path: '/support/agent', builder: (_, __) => const AgentDashboardScreen()),
  // Admin (role guard)
  GoRoute(path: '/admin', builder: (_, __) => const AdminDashboardScreen()),
  GoRoute(path: '/admin/agents', builder: (_, __) => const AdminAgentsScreen()),
  GoRoute(path: '/admin/forum', builder: (_, __) => const AdminForumScreen()),
  GoRoute(path: '/admin/faq', builder: (_, __) => const AdminFaqScreen()),
  GoRoute(path: '/admin/categories', builder: (_, __) => const AdminCategoriesScreen()),
  // Auth extras
  GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
  GoRoute(path: '/reset-password', builder: (_, s) => ResetPasswordScreen(token: s.uri.queryParameters['token'] ?? '')),
  ```
- [ ] Add redirect guard: `/admin/*` → redirect to `/support` if role != 'admin'
- [ ] Add redirect guard: `/support/agent` → redirect to `/support/forum` if role == 'customer'

### 9.7 Add "Support" to bottom nav / drawer

- [ ] In the main app's `HomeScreen` or bottom nav widget:
  - Add a "Support" tab/item → navigates to `/support`
  - If `userProvider.isAgent`: also show "Agent Dashboard" → `/support/agent`
  - If `userProvider.isAdmin`: also show "Admin Panel" → `/admin`

### 9.8 Create customer screens (`osomba/lib/screens/support/`)

- [ ] **`support_home_screen.dart`**:
  - Search bar → navigates to `/support/forum` or `/support/faq` with pre-filled query
  - Category chips (7 categories)
  - "Ask AI" button → `/support/ai`
  - Recent forum posts list (last 5, status=answered/open)
  - Recent FAQ cards (last 3, published)

- [ ] **`forum_list_screen.dart`**:
  - AppBar: "Support Forum"
  - Filter row: CategoryDropdown + StatusFilter chips (All / Open / Answered)
  - ListView of ForumPostCard widgets (title, category badge, status badge, author, date)
  - Pagination (load more on scroll)
  - FAB: "Ask a Question" → `/support/forum/new` (show login prompt if not authenticated)

- [ ] **`forum_thread_screen.dart`**:
  - Title, body, author chip, category badge, status badge, view count
  - If official answer: green "Official Answer" card + agent name + answer text
  - If `isAgent` AND status='open': expandable "Write Official Answer" card (TextField + Submit)
  - If `isAgent` AND status='answered' AND not converted: "Convert to FAQ" OutlinedButton
  - If `isAgent`: popup menu (Lock Thread / Close Thread)
  - "Was this helpful?" thumbs-up for customers

- [ ] **`post_question_screen.dart`**:
  - Redirect to login if not authenticated
  - TextFormField: title (10–200 chars + counter)
  - TextFormField: body (20–5000 chars + counter, multiline)
  - DropdownButtonFormField: category
  - DropdownButtonFormField: language (EN / FR)
  - Submit → POST /forum/posts → pop back with success snackbar

- [ ] **`my_questions_screen.dart`**:
  - Requires login
  - Lists current user's own forum posts with status chips
  - If answered: expandable tile showing answer snippet
  - FAB: "Ask Another Question"

- [ ] **`faq_list_screen.dart`**:
  - Search bar (calls GET /search?type=faq&q=...)
  - Category filter chips
  - ListView of FaqCard widgets (title, category, view count, helpful count)

- [ ] **`faq_article_screen.dart`**:
  - Full article title + body (SelectableText)
  - "Helpful / Not Helpful" thumb buttons
  - Related articles section (same category, published)

- [ ] **`ai_help_board_screen.dart`** — PUBLIC, no login required:
  - On init: generate or retrieve sessionId from SharedPreferences (UUID v4)
  - Language toggle: EN / FR (passes to `/ai/suggest`)
  - TextField: query (min 10 chars + counter) + "Get Help" ElevatedButton
  - Loading: CircularProgressIndicator + "Searching approved content..."
  - Results: ListView of AiSuggestionCard:
    - Title + snippet (first 150 chars)
    - Source chip: "FAQ" (blue) or "Forum Thread" (orange)
    - Confidence stars: 1–5 mapped from similarity_score (<0.7=1★ up to ≥0.85=5★)
    - Category badge
    - Tap → navigate to full content
  - Empty state: "No great match found. Post your question and an agent will help." + button → PostQuestionScreen (pre-filled)
  - Persistent "Still need help?" button → PostQuestionScreen

- [ ] **`agent_dashboard_screen.dart`** — requires agent/admin role:
  - Redirects customers to `/support/forum`
  - Title: "Agent Dashboard — {count} unanswered questions"
  - Sort toggle: Oldest First (default) / Most Viewed
  - Category filter dropdown
  - ListView of OPEN forum posts only
  - Tap tile → ForumThreadScreen

### 9.9 Create admin screens (`osomba/lib/screens/admin/`)

All admin screens guard: redirect to `/support` if role != 'admin'.

- [ ] **`admin_dashboard_screen.dart`**:
  - KPI cards row: Total Posts, Open Posts, Deflection Rate, Total FAQ Views, Avg Response Time
  - BarChart (fl_chart): posts by category
  - LineChart: AI queries over time
  - ListView: Top 10 queries from ai_query_logs
  - Date filter: 7 days / 30 days / All time SegmentedButton

- [ ] **`admin_agents_screen.dart`**:
  - DataTable: current agents (name, email, date promoted)
  - FAB "Add Agent" → AlertDialog with email input → POST `/admin/agents`
  - Row action "Remove" → confirmation dialog → DELETE `/admin/agents/{id}`

- [ ] **`admin_forum_screen.dart`**:
  - DataTable: ALL forum posts, paginated
  - Filter: status chips + category dropdown
  - Tap row → BottomSheet with full thread + official answer
  - Row popup: Lock / Close

- [ ] **`admin_faq_screen.dart`**:
  - DataTable: ALL FAQ articles (includes drafts, archived)
  - Filter: status chips + category dropdown
  - Row actions: Publish (draft→published, triggers embedding) / Archive / Edit (bottom sheet form)
  - FAB "New FAQ" → BottomSheet form

- [ ] **`admin_categories_screen.dart`**:
  - ListView of all 7 categories with settings
  - Tap to edit (AlertDialog): name_en, name_fr, slug, icon, display_order
  - FAB "Add Category"

### 9.10 Update auth screens

- [ ] **`login_screen.dart`** — edit existing:
  - Replace Cognito `signIn` with `authService.login(email, password)`
  - Add "Forgot password?" link → `/forgot-password`

- [ ] **`register_screen.dart`** — edit existing:
  - Replace Cognito `signUp` with `authService.register(email, password, name, lang)`
  - Add language preference DropdownButton (EN / FR)

- [ ] **`forgot_password_screen.dart`** — create new:
  - Email TextField + "Send Reset Link" ElevatedButton
  - On submit: call `authService.forgotPassword(email)`
  - Show: "If that email exists, we sent a reset link."

- [ ] **`reset_password_screen.dart`** — create new:
  - Token received from route parameter
  - New password + confirm password TextFormFields
  - On submit: `authService.resetPassword(token, newPassword)`
  - On success: Navigator to login with SnackBar "Password reset! Please log in."

- [ ] **Commit and push:**
  ```bash
  git add osomba/lib/ osomba/pubspec.yaml
  git commit -m "feat: add support forum Flutter screens and admin panel"
  git push origin main
  ```

---

## SECTION 10 — REMOVED

> Admin functionality is inside the Flutter app (Section 9.9). No separate admin web app.

---

## SECTION 11 — FINAL INTEGRATION & TESTING

### 11.1 Backend (Swagger UI)

- [ ] All endpoints return correct status codes
- [ ] `POST /v1/ai/suggest` with "how do I pay with MPESA?" → returns FAQ suggestions
- [ ] `GET /v1/search?q=payment` → returns mixed FAQ + forum results
- [ ] Agent-only routes return 403 for customers
- [ ] Admin-only routes return 403 for agents
- [ ] Forum status auto-updates to 'answered' when official answer added
- [ ] ContentEmbedding row created when FAQ published or official answer added

### 11.2 Flutter — Customer flow

- [ ] Register new account → lands on home screen
- [ ] Navigate to Support tab → see SupportHomeScreen
- [ ] Use AI board (unauthenticated) → type "my payment failed" → see suggestions with confidence stars
- [ ] Post a question → appears in forum list as 'open'
- [ ] Check "My Questions" → see question with 'open' badge

### 11.3 Flutter — Agent flow

- [ ] Login as `agent@osomba.com`
- [ ] Go to Agent Dashboard → see open questions sorted oldest-first
- [ ] Open thread → write official answer → status becomes 'answered'
- [ ] Tap "Convert to FAQ" → draft FAQ created
- [ ] AI board now returns that content when queried

### 11.4 Flutter — Admin flow

- [ ] Login as `admin@osomba.com`
- [ ] Go to Admin Panel → see analytics dashboard with KPI cards and charts
- [ ] Add an agent by email
- [ ] Go to Admin FAQ → publish the draft FAQ
- [ ] View Admin Forum → close a thread

### 11.5 Polish

- [ ] All screens show CircularProgressIndicator while loading
- [ ] All screens show error SnackBar on API failure
- [ ] 401 → auto-refresh token or redirect to login
- [ ] Empty states shown when lists are empty
- [ ] Tested on Android emulator AND iOS simulator

---

## SECTION 12 — RUNNING INSTRUCTIONS

- [ ] Update `osomba/backend/README.md` — append:
  ```
  # Thesis Support Forum — Backend
  pip install -r requirements.txt
  # Add thesis env vars to .env (see Phase_4/EXECUTION_PLAN.md Section 1.2)
  alembic upgrade head
  python scripts/seed_faqs.py
  uvicorn app.main:app --reload --port 8000
  API docs: http://localhost:8000/docs
  Test accounts: admin@osomba.com/Admin123!, agent@osomba.com/Agent123!, customer@osomba.com/Customer123!
  ```

- [ ] Update `osomba/README.md` — append:
  ```
  # Thesis Support Forum — Flutter
  flutter pub get
  # In osomba/lib/core/constants.dart set kApiBaseUrl:
  #   Android emulator: http://10.0.2.2:8000/v1
  #   iOS simulator:    http://localhost:8000/v1
  #   Physical device:  http://<your-ip>:8000/v1
  flutter run
  ```

---

## COMPLETION CHECKLIST

When all sections are done, verify these work end-to-end:

- [ ] Customer registers → posts question → agent gets email notification (FR-6.2)
- [ ] Customer receives email when question gets official answer (FR-6.1)
- [ ] Customer uses Forgot Password → gets email → resets successfully (FR-1.6)
- [ ] AI board works without login — session tracked via SharedPreferences UUID (FR-5.1)
- [ ] AI board returns top 3-5 results with confidence stars from the 20 seeded FAQs
- [ ] AI board "no match" state shows → user can post directly from AI board
- [ ] Agent dashboard shows only open threads sorted oldest-first
- [ ] Agent answers → status='answered' → embedding created → AI finds it
- [ ] Agent converts answer to FAQ → draft FAQ → publish → embedding created
- [ ] Search returns results from both FAQ and forum threads
- [ ] Admin analytics shows deflection rate, post counts, top categories
- [ ] Admin can add/remove agents by email
- [ ] Language toggle EN/FR works in Flutter (passes language param to all API calls)
- [ ] Rate limiting active: 100 req/min for auth users, 30/min anonymous (via slowapi)
- [ ] All 7 thesis tables + all existing Osomba tables present in DB
- [ ] `git subtree pull --prefix=osomba upstream main --squash` works cleanly
- [ ] Swagger UI at `http://localhost:8000/docs` shows all 19+ thesis endpoints
- [ ] App tested on Android emulator AND iOS simulator
