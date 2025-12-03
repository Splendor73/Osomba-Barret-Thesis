# Technology Stack Document
## Somba Customer Care Forum - Final Tech Decisions

**Author:** Yashu Gautamkumar Patel
**Date:** December 3, 2025
**Phase:** 3 - Technical Research
**Status:** Research & Planning Document (Implementation Pending)

---

## Overview

This document outlines all **planned technology choices** for the Customer Care Forum + AI Help Board project, with detailed rationale for each decision made during the research phase.

**Note:** This is a research and planning document created during Phase 3 (Weeks 5-6). These technology decisions will guide the implementation starting in January 2026 (Phase 4).

---

## Architecture Summary (Planned)

This is the **planned architecture** that will be implemented starting in January 2026:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Client)                     │
│  Next.js 14 + React + TypeScript + Tailwind CSS         │
│  Will be deployed on: AWS Amplify                       │
└─────────────────────────────────────────────────────────┘
                            ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Server)                      │
│  Next.js API Routes (Node.js + Express style)           │
│  Will be deployed on: AWS Amplify (Serverless Lambda)   │
└─────────────────────────────────────────────────────────┘
                            ↓ SQL Queries
┌─────────────────────────────────────────────────────────┐
│                    DATABASE (Storage)                    │
│  PostgreSQL 15+ with pgvector extension                 │
│  Will be hosted on: AWS RDS (Relational Database Svc)   │
└─────────────────────────────────────────────────────────┘
                            ↓ API Calls
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                        │
│  • AWS Bedrock (AI/ML models)                           │
│  • SendGrid (email notifications)                       │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Stack

### Framework: Next.js 14

**What:** React framework with server-side rendering and API routes

**Why:**
- ✅ SEO-friendly (forum posts can be indexed by Google)
- ✅ API routes built-in (no separate backend server needed)
- ✅ TypeScript support out of the box
- ✅ Fast page loads with SSR
- ✅ AWS Amplify supports Next.js SSR out of the box

**Alternatives Considered:**
- Create React App (no SSR, no built-in API)
- Vue.js + Nuxt (smaller ecosystem, less familiar)
- Plain React (requires separate Express server)

---

### Language: TypeScript

**What:** JavaScript with static type checking

**Why:**
- ✅ Catch bugs at compile time, not runtime
- ✅ Better IDE autocomplete and intellisense
- ✅ Makes refactoring safer
- ✅ Good for teams (self-documenting code)

**Configuration:**
```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "es2020"],
    "jsx": "preserve",
    "module": "esnext",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

### Styling: Tailwind CSS

**What:** Utility-first CSS framework

**Why:**
- ✅ Matches the design system from Report #2
- ✅ Fast development (no writing custom CSS)
- ✅ Mobile-responsive utilities built-in
- ✅ Small bundle size (only includes used classes)

**Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',    // Blue
        success: '#10B981',    // Green
        warning: '#F59E0B',    // Yellow
        danger: '#EF4444',     // Red
      }
    }
  }
}
```

---

### State Management: React Context + Hooks

**What:** Built-in React state management

**Why:**
- ✅ No additional library needed (Redux, MobX)
- ✅ Sufficient for app complexity
- ✅ Hooks (useState, useEffect, useContext) cover 95% of needs

**When to Add Redux:**
- If state becomes too complex
- If we add real-time features later
- Not needed for MVP

---

### Form Handling: React Hook Form

**What:** Library for form validation and state

**Why:**
- ✅ Less re-renders than Formik
- ✅ Built-in validation
- ✅ Works great with TypeScript

**Example:**
```typescript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, errors } = useForm();

<input {...register('title', { 
  required: 'Title is required',
  minLength: { value: 10, message: 'Min 10 chars' }
})} />
```

---

## Backend Stack

### API: Next.js API Routes

**What:** Serverless functions in the same Next.js app

**Why:**
- ✅ No separate server to deploy
- ✅ Share types between frontend and backend (TypeScript)
- ✅ Automatic API routing (`/pages/api/forum/posts.ts` → `/api/forum/posts`)
- ✅ AWS Amplify deploys these as Lambda functions automatically

**Structure:**
```
/pages/api/
  ├── auth/
  │   ├── register.ts
  │   ├── login.ts
  │   └── refresh.ts
  ├── forum/
  │   ├── posts/
  │   │   ├── index.ts       # GET /api/forum/posts, POST /api/forum/posts
  │   │   └── [id].ts        # GET /api/forum/posts/:id
  │   └── official-answer.ts
  ├── faq/
  │   ├── articles/
  │   │   └── index.ts
  │   └── convert.ts
  └── ai/
      ├── suggest.ts
      └── escalate.ts
```

---

### Authentication: AWS Cognito

**What:** Managed User Identity and Authentication Service

**Why:**
- ✅ Fully managed (no maintenance of auth servers)
- ✅ Scalable to millions of users
- ✅ Built-in security (MFA, risk-based auth)
- ✅ Compliant (HIPAA, PCI, SOC)
- ✅ Seamless integration with AWS Amplify

**Implementation:**
```typescript
import { signUp, signIn, signOut } from 'aws-amplify/auth';

// Register
await signUp({
  username: 'user@example.com',
  password: 'SecurePassword123!',
  options: {
    userAttributes: {
      email: 'user@example.com',
      name: 'Jane Doe'
    }
  }
});

// Login
await signIn({ 
  username: 'user@example.com', 
  password: 'SecurePassword123!' 
});
```

---

### Database Client: Prisma ORM

**What:** Type-safe database toolkit

**Why:**
- ✅ Auto-generated TypeScript types from schema
- ✅ Migrations built-in
- ✅ Query builder prevents SQL injection
- ✅ Works great with PostgreSQL

**Schema Example:**
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          Role     @default(CUSTOMER)
  forumPosts    ForumPost[]
  createdAt     DateTime @default(now())
}

enum Role {
  CUSTOMER
  AGENT
  ADMIN
}
```

---

## Database Stack

### Database: AWS RDS (PostgreSQL 15+)

**What:** Managed Relational Database Service

**Why:**
- ✅ Industry standard for production workloads
- ✅ Automated backups and patching
- ✅ Scalable compute and storage
- ✅ Supports `pgvector` extension (v15+)
- ✅ High availability options

**Alternatives Considered:**
- DynamoDB (NoSQL, harder to model complex relations)
- Aurora Serverless (Great but higher starting cost)
- EC2 Self-hosted (Too much maintenance)

---

### Vector Search: pgvector Extension

**What:** PostgreSQL extension for vector similarity search

**Why:**
- ✅ Keeps everything in one database
- ✅ No need for separate Pinecone/Weaviate
- ✅ Fast enough for pilot scale
- ✅ Transactional consistency (update FAQ + embedding together)

**Installation:**
```sql
CREATE EXTENSION vector;

CREATE TABLE faq_embeddings (
  id UUID PRIMARY KEY,
  source_id UUID NOT NULL,
  embedding vector(1536),  -- Titan Embeddings v2 dimension
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON faq_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Query Example:**
```sql
SELECT source_id, 
       1 - (embedding <=> $query_embedding) AS similarity
FROM faq_embeddings
WHERE similarity > 0.6
ORDER BY similarity DESC
LIMIT 5;
```

---

### Hosting: AWS Amplify

**What:** Full-stack hosting service for web apps

**Why:**
- ✅ Native support for Next.js SSR
- ✅ Integrated CI/CD pipeline connected to GitHub
- ✅ Easy environment variable management
- ✅ Branch previews (PR builds)
- ✅ Scalable serverless backend (Lambda/API Gateway under the hood)

**Alternatives:**
- Vercel (Easier but not AWS)
- EC2 (Manual setup, hard to maintain)
- Elastic Beanstalk (Older, more complex configuration)

---

### AI/ML Stack

### Embeddings: AWS Bedrock (Titan Embeddings v2)

**What:** Fully managed service for foundation models

**Model:** `amazon.titan-embed-text-v2:0`

**Why:**
- ✅ Data privacy (data doesn't leave AWS environment)
- ✅ Lower latency (internal AWS network)
- ✅ Cost-effective
- ✅ High quality embeddings (1024 or 1536 dimensions)

**API Call:**
```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const input = {
  inputText: "How do I pay with MPESA?"
};

const command = new InvokeModelCommand({
  modelId: "amazon.titan-embed-text-v2:0",
  contentType: "application/json",
  accept: "application/json",
  body: JSON.stringify(input),
});

const response = await client.send(command);
const embedding = JSON.parse(new TextDecoder().decode(response.body)).embedding;
```

**Cost Estimate:**
- Titan Embeddings: $0.00002 per 1k input tokens
- Query: ~50 tokens × 10,000 queries = 500K tokens
- Cost: < $0.01
- FAQ embeddings: 20 × 200 tokens = 4K tokens
- Cost: < $0.01
- **Total: < $1 for pilot**

---

### Generative AI: AWS Bedrock (Claude 3 Haiku)

**What:** LLM for generating answers and suggestions

**Model:** `anthropic.claude-3-haiku-20240307-v1:0`

**Why:**
- ✅ Fast and cost-effective
- ✅ High intelligence for customer support tasks
- ✅ Secure via Bedrock

**Use Cases:**
- Suggesting answers to agents
- Summarizing forum threads
- Converting answers to FAQ articles

---

## DevOps Stack

### Version Control: Git + GitHub

**What:** Code repository and collaboration

**Why:**
- ✅ Industry standard
- ✅ Free for open source
- ✅ Built-in CI/CD (GitHub Actions)
- ✅ Good for thesis documentation

---

### CI/CD: AWS Amplify Build Settings

**What:** Automated testing and deployment

**Configuration:**
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**What It Does:**
- Automatically builds on git push
- Runs tests before deploying
- Deploys to global CDN

---

### Deployment: AWS Amplify

**What:** Platform for Next.js apps

**Why:**
- ✅ AWS Free Tier eligible (12 months)
- ✅ Zero-config deployment (just connect GitHub)
- ✅ Automatic SSL
- ✅ Global CDN (CloudFront)

**How It Works:**
1. Connect GitHub repo to AWS Amplify Console
2. Select `main` branch
3. Amplify automatically builds and deploys
4. Live at `https://main.d12345.amplifyapp.com` (or custom domain)

---

### Environment Variables

**Local Development (.env.local):**
```
DATABASE_URL=postgresql://localhost:5432/somba
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxx
SENDGRID_API_KEY=SG...
```

**Production (AWS Amplify Console):**
- Stored in Amplify Environment Variables
- Encrypted at rest
- Injected during build process

---

## External Services

### Email: SendGrid

**What:** Transactional email service

**Why:**
- ✅ Free tier: 100 emails/day (enough for pilot)
- ✅ Good deliverability
- ✅ Simple API

**Use Cases:**
- Welcome emails (on registration)
- Password reset links
- Notifications (new official answer)
- Dispute updates

**API Example:**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'support@somba.com',
  subject: 'New Answer to Your Question',
  html: '<p>An agent has answered your question...</p>'
});
```

---

## Development Tools

### Code Editor: VS Code

**What:** Code editor

**Extensions:**
- ESLint (linting)
- Prettier (code formatting)
- Tailwind CSS IntelliSense
- Prisma (database schema)

---

### Linter: ESLint

**What:** Catches code issues

**Rules:**
- No unused variables
- Consistent code style
- TypeScript best practices

---

### Formatter: Prettier

**What:** Auto-formats code

**Why:**
- ✅ Consistent style across project
- ✅ No debates about tabs vs spaces
- ✅ Saves time

**Config:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## Testing Stack

### Unit Tests: Jest

**What:** JavaScript testing framework

**Why:**
- ✅ Built-in with Next.js
- ✅ Fast
- ✅ Snapshot testing
- ✅ Good mocking

**Example:**
```typescript
describe('hashPassword', () => {
  it('should hash password securely', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });
});
```

---

### E2E Tests: Playwright (Future)

**What:** Browser automation testing

**When:** After MVP is stable

**Why:**
- ✅ Tests actual user flows
- ✅ Catches UI bugs
- ✅ Simulates real usage

---

## Performance Monitoring

### AWS CloudWatch

**What:** Monitoring and observability service

**Metrics:**
- Lambda execution times
- API error rates
- Database CPU usage

**Why:**
- ✅ Native AWS integration
- ✅ Detailed logs
- ✅ Alarms for errors

---

## Estimated Cost Summary (Pilot - 3 Months)

These are **estimated costs** based on research. Actual costs will be tracked during implementation.

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| **AWS Amplify** (hosting) | Free Tier (12 mo) | $0 |
| **AWS RDS** (database) | Free Tier (750hrs/mo) | $0 |
| **AWS Cognito** (auth) | 50,000 MAU Free | $0 |
| **AWS Bedrock** (AI) | On-demand, ~10K queries | < $5 |
| **SendGrid** (email) | ~1,000 emails | $0 |
| **Domain** (optional) | somba.com | $15/year |
| **Total** | | **$5-25** |

**Expected to be extremely cost-effective by utilizing AWS Free Tier for first 12 months.**

---

## Scalability Plan

### When to Upgrade

**Database (AWS RDS):**
- Upgrade when: Traffic exceeds t3.micro limits
- Action: Resize instance to t3.small or t3.medium
- Cost: ~$30-60/month

**Hosting (AWS Amplify):**
- Upgrade when: Build minutes exceed free tier
- Cost: Pay-as-you-go ($0.023/GB storage, $0.15/GB served)

**AWS Bedrock:**
- Pay-per-token model
- Switch models (e.g., to Claude 3 Sonnet) for higher quality if needed
- No infrastructure management required

---

## Security Checklist

- [x] HTTPS only (Amplify provides)
- [x] HTTPS only (Amplify provides)
- [x] Identity Management (AWS Cognito)
- [x] Access Control (Cognito Groups)
- [x] Environment variables (Amplify Console)
- [x] SQL injection prevention (Prisma)
- [x] XSS prevention (React sanitizes)
- [x] CSRF protection (SameSite cookies)
- [x] Rate limiting (API routes)
- [x] Input validation (React Hook Form + server-side)

---

## Final Tech Stack Summary

These are the **planned technologies** selected after comprehensive research in Phase 3:

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | Next.js 14 + React + TypeScript | SSR, API routes, type safety |
| **Styling** | Tailwind CSS | Fast dev, mobile-responsive |
| **Backend** | Next.js API Routes (Lambda) | Unified app, serverless |
| **Database** | AWS RDS (PostgreSQL 15+) | Managed, scalable, pgvector |
| **ORM** | Prisma | Type-safe queries |
| **Auth** | AWS Cognito | Managed, secure, scalable |
| **AI** | AWS Bedrock (Titan/Claude) | Secure, integrated, cost-effective |
| **Email** | SendGrid | Free tier, reliable |
| **Hosting** | AWS Amplify | CI/CD, Next.js support |
| **CI/CD** | AWS Amplify | Automated builds |
| **Monitoring** | AWS CloudWatch | Native AWS logs |

---

**Research Phase Complete:** December 3, 2025
**Implementation Start Date:** January 2026 (Phase 4)
