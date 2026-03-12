# Osomba Support Forum — Backend API

FastAPI backend for the Osomba Customer Care Forum, FAQ system, and AI Help Board. This is the thesis project component that provides support features for the Osomba Marketplace.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI (Python 3.13) |
| Database | PostgreSQL + pgvector |
| Auth | AWS Cognito (JIT provisioning) |
| Embeddings | AWS Bedrock (Titan Embed Text v2) |
| Translation | Amazon Nova Micro (EN/FR) |
| Email | AWS SES |
| Hosting | Amazon RDS (database), Elastic Beanstalk (API) |

## Architecture

The backend follows a four-layer architecture:

```
Endpoints → Services → CRUD → Models
```

- **Endpoints** (`app/api/v1/endpoints/`) — Handle HTTP requests and responses
- **Services** (`app/services/`) — Business logic (AI search, translation, email)
- **CRUD** (`app/crud/`) — Database read/write operations
- **Models** (`app/models/`) — SQLAlchemy table definitions

### Directory Structure

```
app/
├── main.py                  # Application entry point & CORS middleware
├── core/
│   ├── config.py            # Environment config (DB, AWS, Cognito)
│   └── security.py          # JWT token validation
├── models/
│   ├── user.py              # User model (synced with Cognito)
│   └── support.py           # ForumCategory, ForumTopic, ForumPost, FAQ, AiQueryLog
├── schemas/
│   └── support.py           # Pydantic request/response schemas
├── services/
│   ├── ai_service.py        # Bedrock embeddings + Nova Micro translation
│   ├── auth_service.py      # Cognito JIT provisioning + token validation
│   ├── email_service.py     # SES email notifications
│   ├── forum_service.py     # Forum business logic
│   ├── faq_service.py       # FAQ business logic
│   └── search_service.py    # Semantic + keyword search
├── crud/
│   ├── forum.py             # Forum topic/post CRUD
│   ├── faq.py               # FAQ CRUD
│   └── category.py          # Category CRUD
├── api/
│   ├── dependencies.py      # Dependency injection (SessionDep, CurrentUserDep, AdminUserDep)
│   └── v1/endpoints/
│       ├── forum.py         # Forum topics, posts, official answers, convert-to-FAQ, undo FAQ
│       ├── faq.py           # FAQ CRUD + voting
│       ├── ai.py            # AI suggestion endpoint (semantic search)
│       ├── admin.py         # Analytics + user management
│       ├── categories.py    # Category management
│       ├── auth.py          # Login/token endpoints
│       └── search.py        # Unified search
└── db/
    └── database.py          # SQLAlchemy session + engine
```

## Database Schema

The support system uses five main tables (defined in `app/models/support.py`):

| Table | Purpose |
|---|---|
| `forum_categories` | Six support categories (Payments, Listings, Safety, Disputes, Account, Delivery) |
| `forum_topics` | Forum threads with title, body, and 384-dim vector embedding |
| `forum_posts` | Replies with `is_accepted_answer` flag |
| `faqs` | Curated FAQ articles with vector embedding and `source_post_id` link |
| `ai_query_logs` | Logs every AI query for analytics (deflection rate, top queries) |

## API Endpoints

### Forum
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/support/topics` | Any | List topics (paginated, translatable) |
| GET | `/support/topics/{id}` | Any | Get single topic (translated if `lang` param) |
| POST | `/support/topics` | User | Create new topic |
| POST | `/support/topics/{id}/posts` | User | Reply to a topic |
| POST | `/support/topics/{id}/official-answer` | Agent+ | Mark reply as official answer + email notification |
| POST | `/support/topics/{id}/lock` | Agent+ | Lock/unlock thread |
| POST | `/support/topics/{id}/convert-to-faq` | Admin | Convert official answer to FAQ |
| DELETE | `/support/topics/{id}/undo-faq/{post_id}` | Admin | Revert FAQ back to normal post |
| GET | `/support/topics/{id}/faq-status/{post_id}` | Admin | Check if post has been converted to FAQ |

### FAQ
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/support/faq/` | Any | List all FAQs |
| GET | `/support/faq/{id}` | Any | Get single FAQ |
| POST | `/support/faq/` | Agent+ | Create FAQ (auto-generates embedding) |
| PUT | `/support/faq/{id}` | Agent+ | Update FAQ |
| DELETE | `/support/faq/{id}` | Agent+ | Delete FAQ |
| POST | `/support/faq/{id}/vote` | Any | Helpful/not helpful vote |

### AI
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/support/ai/suggest` | Any | Semantic search against FAQ + ForumTopic |
| POST | `/support/ai/escalate` | Any | Log escalation to forum |

### Admin
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/admin/analytics` | Admin | Dashboard metrics (deflection rate, response time, etc.) |
| GET | `/admin/users` | Admin | List users with search |
| PUT | `/admin/users/{id}/role` | Admin | Change user role (updates DB + Cognito) |

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL with pgvector extension
- AWS account with Cognito, Bedrock, SES configured

### 1. Clone and set up environment

```bash
cd Phase_05/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment variables

Create a `.env` file in this directory:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/marketplace_test
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
SES_SENDER_EMAIL=noreply@yourdomain.com
```

### 3. Run database migrations

```bash
alembic upgrade head
```

### 4. Start the server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

### 5. API Documentation

FastAPI auto-generates interactive docs:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

```bash
# Run all tests
pytest tests/

# Run specific test suites
pytest tests/test_api_forum.py        # Forum endpoints
pytest tests/test_api_faq_thesis.py   # FAQ endpoints
pytest tests/test_api_ai_thesis.py    # AI suggestion endpoint
pytest tests/test_api_support_admin_thesis.py  # Admin analytics
```

Tests use `pytest-mock` to mock AWS services (Bedrock, SES) so they run without AWS credentials.

## Demo Accounts

These accounts exist in both AWS Cognito and the local database:

| Role | Email | Password |
|---|---|---|
| Customer | `customer@osomba.com` | `OsombaDemo123!` |
| Agent | `agent@osomba.com` | `OsombaDemo123!` |
| Admin | `admin@osomba.com` | `OsombaDemo123!` |

## Utility Scripts

| Script | Purpose |
|---|---|
| `scripts/list_users.py` | List all users in the database |
| `scripts/update_user.py` | Update user role or details |
| `scripts/test_nova.py` | Test Nova Micro translation |
| `scripts/test_titan.py` | Test Titan embedding generation |
| `scripts/test_ses.py` | Test SES email sending |
| `scripts/test_translate.py` | Test translation pipeline |
