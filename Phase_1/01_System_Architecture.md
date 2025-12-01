# Somba Customer Care Forum: System Architecture Document

## Project Overview
**Thesis:** Customer Care Forum + AI Help Board for Somba Marketplace  
**Author:** Yashu Gautamkumar Patel  
**Date:** November 30, 2025  
**Report Period:** Weeks 1-2 (Foundation Phase)

---

## Architecture Overview

The system follows a **three-tier architecture** to ensure scalability, maintainability, and separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                       │
│                     (Frontend Web Application)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │   Customer   │  │    Agent     │  │       Admin         │    │
│  │   Interface  │  │  Dashboard   │  │   Management        │    │
│  └──────────────┘  └──────────────┘  └─────────────────────┘    │
│         │                  │                    │               │
│         └──────────────────┴────────────────────┘               │
│                           │                                     │
│                    HTTPS/REST API                               │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│                    (Backend API Server)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              RESTful API Endpoints                       │   │
│  │  • Authentication & Authorization (JWT)                  │   │
│  │  • Forum Post CRUD Operations                            │   │
│  │  • FAQ Article Management                                │   │
│  │  • Search Service (Unified Forum + FAQ)                  │   │
│  │  • AI Help Board Service (RAG Pipeline)                  │   │
│  │  • Agent Actions (Official Answers, Lock/Close)          │   │
│  │  • Notification Service                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                    │
│  ┌─────────────────────────┴─────────────────────────────────┐  │
│  │            Business Logic Layer                           │  │
│  │  • Role-Based Access Control (Customer/Agent/Admin)       │  │
│  │  • Category Management (6 core categories + Other)        │  │
│  │  • Official Answer Validation                             │  │
│  │  • Agent → FAQ Conversion Logic                           │  │
│  │  • AI Query Processing & Constraint Enforcement           │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                        DATA LAYER                               │
│                   (Database & Storage)                          │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │  Relational Database    │  │   Vector Database            │  │
│  │  (PostgreSQL)           │  │   (pgvector / Pinecone)      │  │
│  │  • users                │  │   • FAQ embeddings           │  │
│  │  • forum_posts          │  │   • Forum thread embeddings  │  │
│  │  • faq_articles         │  │   • Semantic search index    │  │
│  │  • categories           │  │                              │  │
│  │  • official_answers     │  └──────────────────────────────┘  │
│  │  • ai_query_logs        │                                    │
│  │  • content_embeddings   │                                    │
│  └─────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Descriptions

### 1. Presentation Layer (Frontend)
**Technology Options:** React.js + Next.js (preferred) or Vue.js  
**Deployment:** Vercel or Netlify

**Key Components:**
- **Customer Interface:**
  - Unified search bar (FAQ + Forum results)
  - Post question form with category selector
  - Thread view with conversation history
  - AI Help Board query interface
  
- **Agent Dashboard:**
  - Browse unanswered forum threads
  - Provide official answers
  - Lock/close resolved threads
  - Convert answers → FAQ articles (one-click)
  
- **Admin Panel:**
  - User management (role assignment)
  - Category management
  - Content moderation
  - Analytics dashboard (KPIs)

**Authentication:** JWT tokens stored in httpOnly cookies

---

### 2. Application Layer (Backend)
**Technology Options:** Node.js + Express.js OR Python + FastAPI  
**Deployment:** AWS EC2, Google Cloud Run, or Railway

**Core Services:**

#### A. Authentication Service
- User registration/login
- JWT token generation & validation
- Role-based middleware (Customer/Agent/Admin)
- Session management

#### B. Forum Service
- CRUD operations for forum posts
- Thread state management (open/locked/closed)
- Category assignment and filtering
- Pagination and sorting

#### C. FAQ Service
- CRUD operations for FAQ articles
- Agent bookmark → FAQ conversion
- Multi-language support (English/French scaffolding)
- Tagging and categorization

#### D. Search Service
- Unified search across Forum + FAQ
- Full-text search (PostgreSQL `tsvector`)
- Result ranking by relevance and recency
- Result type labeling (FAQ vs Forum)

#### E. AI Help Board Service
- **RAG (Retrieval-Augmented Generation) Pipeline:**
  1. User query → embedding generation
  2. Vector similarity search (approved content only)
  3. Rank results by semantic similarity + metadata
  4. Return top 3-5 suggestions with titles + snippets
  5. Escalation trigger (if confidence < threshold)
  
- **Content Constraints:**
  - ✅ Only FAQ articles (status = 'published')
  - ✅ Only forum threads with official answers
  - ❌ No external sources
  - ❌ No open-ended LLM generation

#### F. Notification Service
- Email/push notifications for:
  - New official answer on user's thread
  - Thread status change (locked/closed)
  - Agent assignments

---

### 3. Data Layer (Database)

#### A. Relational Database (PostgreSQL)
**Purpose:** Store structured data (users, posts, FAQs, relationships)

**Key Tables:**
- `users` (id, email, name, role, created_at)
- `categories` (id, name, description, parent_id)
- `forum_posts` (id, user_id, category_id, title, body, status, language, created_at)
- `faq_articles` (id, agent_id, category_id, title, body, status, language, created_at)
- `official_answers` (id, forum_post_id, agent_id, answer_text, created_at)
- `ai_query_logs` (id, user_id, query_text, results_shown, escalated, created_at)
- `content_embeddings` (id, source_type, source_id, embedding, metadata)

#### B. Vector Database (pgvector extension OR separate Pinecone/Weaviate)
**Purpose:** Store embeddings for semantic search

**Stored Data:**
- `content_embeddings` table containing:
  - FAQ article embeddings (title + body)
  - Forum thread embeddings (title + official answer)
  - Metadata (source type, category, language, timestamp)

---

## Data Flow Examples

### Example 1: Customer Posts a Question
1. Customer submits question via frontend (POST /forum/posts)
2. Backend validates input & checks authentication
3. Forum post saved to PostgreSQL (`forum_posts` table)
4. Notification sent to available agents
5. Response returned to customer (thread ID, status)

### Example 2: AI Help Board Query
1. Customer enters query in AI Help Board (POST /ai/suggest)
2. Backend generates embedding using OpenAI API or Sentence-BERT
3. Vector search queries pgvector for similar FAQ/forum content
4. Results ranked by similarity score + recency
5. Top 3-5 results returned with titles, snippets, source type
6. If no results above threshold → suggest "Post to Forum"

### Example 3: Agent Converts Answer to FAQ
1. Agent marks answer as "Official" (POST /forum/posts/{id}/official-answer)
2. Agent clicks "Bookmark as FAQ" button (POST /faq/convert-from-forum/{id})
3. Backend creates new FAQ article from thread data
4. FAQ article generated with:
   - Title: Forum post title
   - Body: Official answer text
   - Category: Inherited from forum post
   - Status: Draft (agent can edit before publishing)
5. FAQ embedding generated and stored in vector DB
6. Thread marked as "Resolved" and locked

---

## Security Considerations

1. **Authentication:**
   - JWT tokens with 24-hour expiration
   - Refresh tokens for session persistence
   - Password hashing (bcrypt)

2. **Authorization:**
   - Role-based access control (RBAC)
   - Middleware checks on every protected route
   - Customers: read-only + post questions
   - Agents: all customer actions + provide official answers + convert to FAQ
   - Admins: full access + user management

3. **Input Validation:**
   - Sanitize all user inputs (prevent XSS)
   - Rate limiting on API endpoints (prevent abuse)
   - File upload restrictions (if added later)

4. **Data Privacy:**
   - PII (email, name) encrypted at rest
   - GDPR-compliant data deletion
   - Audit logs for admin actions

---

## Scalability & Performance

1. **Database Optimization:**
   - Indexes on frequently queried fields (category_id, user_id, created_at)
   - Full-text search indexes (PostgreSQL `GIN` index on `tsvector`)
   - Connection pooling (pg-pool or SQLAlchemy)

2. **Caching:**
   - Redis for frequently accessed FAQ articles
   - Cache invalidation on FAQ updates
   - Session storage in Redis

3. **API Rate Limiting:**
   - 100 requests/minute per user (search)
   - 10 requests/minute per user (post creation)
   - 1000 requests/minute for AI suggestions (shared pool)

4. **Horizontal Scaling:**
   - Stateless API servers (deploy multiple instances behind load balancer)
   - Separate read replicas for search queries
   - Message queue (RabbitMQ/Bull) for async tasks (email notifications)

---

## Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js (React) + TypeScript | SSR for SEO, type safety, rapid development |
| **Backend** | Node.js + Express.js | JavaScript full-stack, large ecosystem, async I/O |
| **Database** | PostgreSQL + pgvector | Relational data + vector search in one system |
| **Authentication** | JWT + bcrypt | Stateless, secure, industry-standard |
| **AI Embeddings** | OpenAI text-embedding-ada-002 | High-quality multilingual embeddings |
| **Hosting** | Frontend: Vercel, Backend: Railway, DB: Supabase or AWS RDS | Cost-effective, scalable, managed services |
| **Version Control** | GitHub + GitHub Actions | CI/CD, automated testing |

---

## Next Phase: UI/UX Design

With the system architecture defined, the next bi-weekly period will focus on:
- User flow diagrams for Customer, Agent, Admin
- Wireframes for Forum, FAQ, AI Help Board
- High-fidelity mockups in Figma
- Component library design

---


