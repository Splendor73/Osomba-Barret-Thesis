# Somba Customer Care Forum: Database Schema Document

## Project Information
**Author:** Yashu Gautamkumar Patel  
**Date:** November 30, 2025  
**Database:** PostgreSQL 14+ with pgvector extension  
**Report Period:** Weeks 1-2

---

## Schema Overview

This database schema supports:
- User authentication and role-based access control
- Forum threads with categories and official answers
- FAQ article management with multi-language support
- AI query logging and telemetry
- Agent-to-FAQ conversion workflow

**Total Tables:** 8 core tables + 2 junction tables

---

## Entity-Relationship Diagram (Text Format)

```
users (1) ──────< (M) forum_posts
  │                       │
  │                       └──> (1) official_answers (1)
  │                       │
  │                       └──> (M) categories (1)
  │
  ├─────< (M) faq_articles
  │               │
  │               └──> (M) categories (1)
  │
  └─────< (M) ai_query_logs


Legend:
(1) = One
(M) = Many
──< = One-to-Many relationship
```

---

## Table Definitions

### 1. `users`
**Purpose:** Store user accounts with role-based access

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (login credential) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NOT NULL | User's full name |
| role | ENUM('customer', 'agent', 'admin') | NOT NULL, DEFAULT 'customer' | User role for RBAC |
| language_preference | ENUM('en', 'fr') | DEFAULT 'en' | UI language preference |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_users_email` on `email` (for login lookups)
- `idx_users_role` on `role` (for role filtering)

**Sample Data:**
```sql
INSERT INTO users (id, email, password_hash, name, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'customer@somba.com', '$2b$10$...', 'Jane Doe', 'customer'),
('550e8400-e29b-41d4-a716-446655440001', 'agent@somba.com', '$2b$10$...', 'John Agent', 'agent');
```

---

### 2. `categories`
**Purpose:** Organize forum posts and FAQ articles into support topics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing category ID |
| name_en | VARCHAR(100) | NOT NULL | Category name in English |
| name_fr | VARCHAR(100) | NULL | Category name in French |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly identifier |
| description | TEXT | NULL | Category description |
| icon | VARCHAR(50) | NULL | Icon identifier (e.g., 'payment', 'safety') |
| display_order | INTEGER | DEFAULT 0 | Sort order in UI |
| is_active | BOOLEAN | DEFAULT TRUE | Whether category is visible |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Predefined Categories:**
```sql
INSERT INTO categories (name_en, name_fr, slug, icon, display_order) VALUES
('Payments', 'Paiements', 'payments', 'credit-card', 1),
('Listings', 'Annonces', 'listings', 'list', 2),
('Safety', 'Sécurité', 'safety', 'shield', 3),
('Disputes', 'Litiges', 'disputes', 'alert-circle', 4),
('Account', 'Compte', 'account', 'user', 5),
('Delivery', 'Livraison', 'delivery', 'truck', 6),
('Other', 'Autre', 'other', 'help-circle', 7);
```

**Indexes:**
- `idx_categories_slug` on `slug`
- `idx_categories_active` on `is_active`

---

### 3. `forum_posts`
**Purpose:** Store customer questions and thread conversations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique thread identifier |
| user_id | UUID | FOREIGN KEY → users(id), NOT NULL | Author of the post |
| category_id | INTEGER | FOREIGN KEY → categories(id), NOT NULL | Topic category |
| title | VARCHAR(200) | NOT NULL | Question title |
| body | TEXT | NOT NULL | Question details |
| language | ENUM('en', 'fr') | DEFAULT 'en' | Post language |
| status | ENUM('open', 'answered', 'locked', 'closed') | DEFAULT 'open' | Thread state |
| view_count | INTEGER | DEFAULT 0 | Number of views |
| search_vector | TSVECTOR | NULL | Full-text search index |
| created_at | TIMESTAMP | DEFAULT NOW() | Post creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_forum_posts_user` on `user_id`
- `idx_forum_posts_category` on `category_id`
- `idx_forum_posts_status` on `status`
- `idx_forum_posts_search` GIN index on `search_vector` (full-text search)
- `idx_forum_posts_created` on `created_at DESC` (recent posts)

**Triggers:**
```sql
-- Auto-update search_vector when title/body changes
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON forum_posts FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', title, body);
```

**Sample Data:**
```sql
INSERT INTO forum_posts (id, user_id, category_id, title, body, status) VALUES
('660e8400-e29b-41d4-a716-446655440000', 
 '550e8400-e29b-41d4-a716-446655440000',
 1,
 'MPESA payment not reflecting in my account',
 'I made a payment 2 hours ago via MPESA but I still don''t see it in my Somba wallet. Transaction ID: MPX12345. Please help!',
 'open');
```

---

### 4. `official_answers`
**Purpose:** Store agent-provided authoritative answers to forum threads

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique answer identifier |
| forum_post_id | UUID | FOREIGN KEY → forum_posts(id), UNIQUE, NOT NULL | Thread being answered |
| agent_id | UUID | FOREIGN KEY → users(id), NOT NULL | Agent who provided answer |
| answer_text | TEXT | NOT NULL | Official answer content |
| is_converted_to_faq | BOOLEAN | DEFAULT FALSE | Whether converted to FAQ |
| created_at | TIMESTAMP | DEFAULT NOW() | Answer timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last edit timestamp |

**Constraints:**
- One official answer per forum post (enforced by UNIQUE on `forum_post_id`)
- Only users with role='agent' or role='admin' can insert

**Indexes:**
- `idx_official_answers_post` on `forum_post_id`
- `idx_official_answers_agent` on `agent_id`
- `idx_official_answers_faq_converted` on `is_converted_to_faq`

**Sample Data:**
```sql
INSERT INTO official_answers (id, forum_post_id, agent_id, answer_text) VALUES
('770e8400-e29b-41d4-a716-446655440000',
 '660e8400-e29b-41d4-a716-446655440000',
 '550e8400-e29b-41d4-a716-446655440001',
 'Thank you for contacting us. MPESA payments typically reflect within 5-10 minutes. Your transaction MPX12345 was successful but there was a delay in our webhook. Your wallet has now been credited. You can verify in Settings > Wallet.');
```

---

### 5. `faq_articles`
**Purpose:** Store curated FAQ articles for self-service support

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique FAQ identifier |
| agent_id | UUID | FOREIGN KEY → users(id), NOT NULL | Author/editor agent |
| category_id | INTEGER | FOREIGN KEY → categories(id), NOT NULL | Topic category |
| title | VARCHAR(200) | NOT NULL | FAQ question/title |
| body | TEXT | NOT NULL | FAQ answer content |
| language | ENUM('en', 'fr') | DEFAULT 'en' | Article language |
| status | ENUM('draft', 'published', 'archived') | DEFAULT 'draft' | Publication state |
| source_forum_post_id | UUID | FOREIGN KEY → forum_posts(id), NULL | If converted from forum |
| view_count | INTEGER | DEFAULT 0 | Number of views |
| helpful_count | INTEGER | DEFAULT 0 | Upvotes (if feedback added) |
| search_vector | TSVECTOR | NULL | Full-text search index |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_faq_category` on `category_id`
- `idx_faq_status` on `status`
- `idx_faq_language` on `language`
- `idx_faq_search` GIN index on `search_vector`
- `idx_faq_created` on `created_at DESC`

**Triggers:**
```sql
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON faq_articles FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', title, body);
```

**Sample Data:**
```sql
INSERT INTO faq_articles (id, agent_id, category_id, title, body, status) VALUES
('880e8400-e29b-41d4-a716-446655440000',
 '550e8400-e29b-41d4-a716-446655440001',
 1,
 'How do I pay with MPESA?',
 'To pay with MPESA:\n1. Select MPESA at checkout\n2. Enter your phone number\n3. You will receive an STK push on your phone\n4. Enter your MPESA PIN\n5. Payment confirmation will appear within 10 seconds',
 'published');
```

---

### 6. `ai_query_logs`
**Purpose:** Track AI Help Board usage for evaluation and analytics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log entry identifier |
| user_id | UUID | FOREIGN KEY → users(id), NULL | User who made query (null if anonymous) |
| query_text | TEXT | NOT NULL | User's question |
| language | ENUM('en', 'fr') | DEFAULT 'en' | Query language |
| results_returned | INTEGER | DEFAULT 0 | Number of suggestions shown |
| top_result_id | VARCHAR(100) | NULL | ID of top-ranked result |
| top_result_type | ENUM('faq', 'forum') | NULL | Type of top result |
| top_result_score | DECIMAL(5,4) | NULL | Similarity score (0-1) |
| escalated_to_forum | BOOLEAN | DEFAULT FALSE | Whether user posted to forum after |
| created_forum_post_id | UUID | FOREIGN KEY → forum_posts(id), NULL | If escalated, the new post ID |
| session_id | VARCHAR(100) | NULL | Session identifier for tracking |
| created_at | TIMESTAMP | DEFAULT NOW() | Query timestamp |

**Indexes:**
- `idx_ai_logs_user` on `user_id`
- `idx_ai_logs_escalated` on `escalated_to_forum`
- `idx_ai_logs_created` on `created_at DESC`
- `idx_ai_logs_session` on `session_id`

**Purpose of Telemetry:**
- Track most common questions (inform FAQ priorities)
- Measure deflection rate (queries resolved without forum post)
- Evaluate AI suggestion quality (score distribution)
- Identify knowledge gaps (high escalation queries)

**Sample Data:**
```sql
INSERT INTO ai_query_logs (id, user_id, query_text, results_returned, top_result_type, top_result_score) VALUES
('990e8400-e29b-41d4-a716-446655440000',
 '550e8400-e29b-41d4-a716-446655440000',
 'How long does MPESA payment take?',
 3,
 'faq',
 0.8742);
```

---

### 7. `content_embeddings`
**Purpose:** Store vector embeddings for semantic search (FAQ articles and Forum threads)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique embedding record |
| source_type | ENUM('faq', 'forum') | NOT NULL | Content type |
| source_id | UUID | NOT NULL | FAQ or forum post ID |
| embedding | VECTOR(1536) | NOT NULL | OpenAI ada-002 embedding |
| metadata | JSONB | NULL | Additional metadata (category, language, etc.) |
| created_at | TIMESTAMP | DEFAULT NOW() | Embedding generation time |

**Indexes:**
- `idx_embeddings_source` on `(source_type, source_id)`
- `idx_embeddings_vector` using ivfflat on `embedding vector_cosine_ops` (pgvector)

**Notes:**
- Requires `pgvector` extension: `CREATE EXTENSION vector;`
- Embedding dimension = 1536 (OpenAI text-embedding-ada-002). *Note: If using Sentence-BERT, adjust to 384 or 768.*
- Cosine similarity for semantic search

**Sample Query (Find Similar Content):**
```sql
SELECT 
  source_type,
  source_id,
  1 - (embedding <=> '[query_embedding_vector]') AS similarity
FROM content_embeddings
WHERE metadata->>'language' = 'en'
  AND (source_type = 'faq' OR (source_type = 'forum' AND metadata->>'has_official_answer' = 'true'))
ORDER BY embedding <=> '[query_embedding_vector]'
LIMIT 5;
```

---

### 8. `user_sessions`
**Purpose:** Track active user sessions for authentication

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Session identifier |
| user_id | UUID | FOREIGN KEY → users(id), NOT NULL | Session owner |
| refresh_token | VARCHAR(500) | UNIQUE, NOT NULL | JWT refresh token |
| ip_address | INET | NULL | Client IP address |
| user_agent | TEXT | NULL | Browser/device info |
| expires_at | TIMESTAMP | NOT NULL | Session expiration |
| created_at | TIMESTAMP | DEFAULT NOW() | Session start time |

**Indexes:**
- `idx_sessions_user` on `user_id`
- `idx_sessions_token` on `refresh_token`
- `idx_sessions_expires` on `expires_at`

---

## Junction Tables (Future Expansion)

### 9. `forum_post_tags` (Optional)
For adding flexible tagging beyond categories

| Column | Type | Constraints |
|--------|------|-------------|
| forum_post_id | UUID | FOREIGN KEY → forum_posts(id) |
| tag | VARCHAR(50) | NOT NULL |
| PRIMARY KEY | (forum_post_id, tag) | |

---

### 10. `faq_related_articles` (Optional)
For linking related FAQ articles

| Column | Type | Constraints |
|--------|------|-------------|
| faq_id | UUID | FOREIGN KEY → faq_articles(id) |
| related_faq_id | UUID | FOREIGN KEY → faq_articles(id) |
| PRIMARY KEY | (faq_id, related_faq_id) | |

---

## Database Constraints & Rules

### Foreign Key Constraints
```sql
ALTER TABLE forum_posts
  ADD CONSTRAINT fk_forum_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_forum_category FOREIGN KEY (category_id) REFERENCES categories(id);

ALTER TABLE official_answers
  ADD CONSTRAINT fk_answer_post FOREIGN KEY (forum_post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_answer_agent FOREIGN KEY (agent_id) REFERENCES users(id);

ALTER TABLE faq_articles
  ADD CONSTRAINT fk_faq_agent FOREIGN KEY (agent_id) REFERENCES users(id),
  ADD CONSTRAINT fk_faq_category FOREIGN KEY (category_id) REFERENCES categories(id),
  ADD CONSTRAINT fk_faq_source FOREIGN KEY (source_forum_post_id) REFERENCES forum_posts(id) ON DELETE SET NULL;
```

### Check Constraints
```sql
-- Ensure agents/admins only can create official answers
ALTER TABLE official_answers
  ADD CONSTRAINT chk_agent_role CHECK (
    agent_id IN (SELECT id FROM users WHERE role IN ('agent', 'admin'))
  );

-- Ensure forum posts are open before answering
ALTER TABLE official_answers
  ADD CONSTRAINT chk_post_status CHECK (
    forum_post_id IN (SELECT id FROM forum_posts WHERE status = 'open')
  );
```

### Triggers

**Auto-update `updated_at` timestamp:**
```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forum_posts_timestamp
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_faq_articles_timestamp
  BEFORE UPDATE ON faq_articles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

**Auto-update forum post status when official answer added:**
```sql
CREATE OR REPLACE FUNCTION update_forum_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET status = 'answered'
  WHERE id = NEW.forum_post_id AND status = 'open';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_forum_answered
  AFTER INSERT ON official_answers
  FOR EACH ROW EXECUTE FUNCTION update_forum_status();
```

---

## Sample Queries

### 1. Unified Search (Forum + FAQ)
```sql
-- Search across both forum posts and FAQ articles
(
  SELECT 
    'forum' as type,
    id,
    title,
    LEFT(body, 200) as snippet,
    created_at,
    ts_rank(search_vector, plainto_tsquery('english', 'mpesa payment')) as rank
  FROM forum_posts
  WHERE search_vector @@ plainto_tsquery('english', 'mpesa payment')
    AND status IN ('answered', 'locked', 'closed')
)
UNION ALL
(
  SELECT 
    'faq' as type,
    id,
    title,
    LEFT(body, 200) as snippet,
    created_at,
    ts_rank(search_vector, plainto_tsquery('english', 'mpesa payment')) as rank
  FROM faq_articles
  WHERE search_vector @@ plainto_tsquery('english', 'mpesa payment')
    AND status = 'published'
)
ORDER BY rank DESC, created_at DESC
LIMIT 10;
```

### 2. Agent Dashboard: Unanswered Threads
```sql
SELECT 
  fp.id,
  fp.title,
  fp.created_at,
  c.name_en as category,
  u.name as author
FROM forum_posts fp
JOIN users u ON fp.user_id = u.id
JOIN categories c ON fp.category_id = c.id
LEFT JOIN official_answers oa ON fp.id = oa.forum_post_id
WHERE fp.status = 'open'
  AND oa.id IS NULL
ORDER BY fp.created_at ASC;
```

### 3. Top FAQ Articles by Views
```sql
SELECT 
  fa.title,
  c.name_en as category,
  fa.view_count,
  fa.helpful_count
FROM faq_articles fa
JOIN categories c ON fa.category_id = c.id
WHERE fa.status = 'published'
ORDER BY fa.view_count DESC
LIMIT 10;
```

### 4. AI Help Board Analytics: Deflection Rate
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_queries,
  SUM(CASE WHEN escalated_to_forum = TRUE THEN 1 ELSE 0 END) as escalated,
  ROUND(
    100.0 * SUM(CASE WHEN escalated_to_forum = FALSE THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) as deflection_rate_pct
FROM ai_query_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Migration Strategy

**Phase 1: Core Tables (Week 1)**
- `users`, `categories`, `forum_posts`, `official_answers`

**Phase 2: FAQ System (Week 2)**
- `faq_articles`, `content_embeddings`

**Phase 3: AI Telemetry (Week 3)**
- `ai_query_logs`, `user_sessions`

**Phase 4: Optimizations (Week 4+)**
- Add indexes
- Set up triggers
- Create views for common queries

---

## Backup & Maintenance

1. **Daily Backups:** Automated PostgreSQL dumps
2. **Archival Strategy:** Move forum posts older than 2 years to archive table
3. **Index Maintenance:** Weekly `REINDEX` on full-text search indexes
4. **Embedding Refresh:** Re-generate embeddings quarterly for updated content

---


