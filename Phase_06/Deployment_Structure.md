# Phase 06 — Deployment Structure and Handoff Guide

## Osomba Support Forum Deployment

**Project:** Osomba Marketplace: Unified Support Forum and FAQ with AI-Assisted Answers  
**Student:** Yashu Gautamkumar Patel  
**Purpose of this document:** Explain how the deployed support system is structured so future team members can maintain it without reverse engineering the AWS setup.

---

## 1. Why the Deployment Was Split

The support forum was not deployed inside the main marketplace backend. It was deployed as a
separate service for one main reason: safety.

At the end of the semester, the original Osomba app already had its own backend, database, and
mobile workflows running. Merging the full Barrett support backend directly into that app would
have created too much risk because:

- the thesis project introduced new tables, new admin workflows, and new AI-related services
- the Barrett backend originally contained copied routes from the marketplace app that were not
  needed for support
- changing the original production backend too heavily at that stage could have broken the main app

So the final deployment approach was:

- keep the original app backend running as-is
- deploy the support backend separately
- deploy the support frontend separately
- reuse the same AWS RDS PostgreSQL instance
- reuse the same Cognito user pool
- expose everything under Osomba-controlled URLs so it still feels like one product

This gave the team a middle ground: shared data, shared auth, but isolated deploys.

---

## 2. Final Production URL Structure

The system is split into three public-facing surfaces.

### Original marketplace backend

- Base URL: `https://api.osomba.com/api/v1`
- Purpose: existing production marketplace APIs used by the mobile app and main product

### Support backend

- Base URL: `https://api.osomba.com/support-api/api/v1`
- Purpose: support/forum/FAQ/AI/admin APIs for the thesis project

### Support frontend

- Current live CloudFront URL: `https://d8612cntnz17z.cloudfront.net`
- Intended final customer URL: `https://support.osomba.com`
- Purpose: the web frontend that customers, agents, and admins use for the support forum

The mobile app should open the support frontend URL, not the support backend URL.

---

## 3. High-Level Architecture

The deployed structure is:

1. Customer opens the support forum frontend in a browser or in-app browser
2. The support frontend sends requests to `https://api.osomba.com/support-api/api/v1`
3. The support backend runs in its own Elastic Beanstalk environment
4. AWS Application Load Balancer forwards `/support-api/*` traffic to the support backend
5. The support backend connects to the same AWS RDS PostgreSQL instance used by the original app
6. Authentication is validated against the same Cognito user pool as the original app
7. Static frontend files are hosted from S3 through CloudFront

In simple terms:

- frontend is separate
- backend is separate
- auth is shared
- database server is shared

---

## 4. AWS Components Used

### 4.1 Elastic Beanstalk

The support backend is deployed as its own Elastic Beanstalk application/environment.

Resources:

- Elastic Beanstalk application: `osomba_support`
- Elastic Beanstalk environment: `osomba-support-env`

Why Elastic Beanstalk was used:

- the team was already using AWS
- FastAPI could be deployed with a fairly standard EB Python setup
- environment variables could be managed without rewriting the whole deployment pipeline

Important note:

The support backend is not mounted into the original FastAPI service. It is a separate deploy.

### 4.2 Application Load Balancer

The production API domain already existed for the main backend. Instead of creating another public
domain for the support backend, path-based routing was added on the existing ALB.

Routing rule:

- `/support-api`
- `/support-api/*`

These requests are forwarded to the support backend target group instead of the marketplace backend.

This is why both APIs can live under `api.osomba.com` without actually being the same backend.

### 4.3 Target Group

Support backend traffic is forwarded into a dedicated target group.

Resource:

- Target group: `osomba-support-shared-tg`

This target group is attached to the support backend Auto Scaling group created by Elastic
Beanstalk.

### 4.4 AWS RDS PostgreSQL

The support backend uses the same PostgreSQL instance as the original Osomba app.

RDS host:

- `osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com`

This was intentional because the support system needs real user context, and because it allows the
forum to share identity and related marketplace information without duplicating everything into a
second database.

### 4.5 Amazon Cognito

The support service uses the same Cognito user pool as the original app.

Values:

- User Pool ID: `us-east-1_vf5HVszbN`
- App Client ID: `513m3vscibhska2jie3ganrcn9`

This means:

- the same user can log into the support forum with the same Osomba account
- agent/admin access is based on Cognito groups plus support role mapping

### 4.6 S3 + CloudFront

The support frontend is a static frontend deployment.

Resources:

- S3 bucket: `osomba-support-frontend-prod-281505305629`
- CloudFront distribution ID: `E1K1SA4V13MTNM`
- CloudFront domain: `d8612cntnz17z.cloudfront.net`

Flow:

- Vite build outputs static files into `frontend/build`
- files are synced to the S3 bucket
- CloudFront serves the frontend globally over HTTPS

### 4.7 ACM

AWS Certificate Manager is used for TLS certificates.

Already in use:

- `api.osomba.com` certificate exists in `us-east-1`

Requested for support frontend vanity domain:

- `support.osomba.com`

Because CloudFront requires ACM certificates in `us-east-1`, any custom frontend subdomain should
always have its certificate created there, not in another region.

---

## 5. Database Strategy

This part is extremely important for future maintainers.

The support system uses the same RDS instance as the marketplace app, but support-owned data is
stored separately from the marketplace domain tables.

### Shared components

- same PostgreSQL server
- same user identities
- same AWS credentials/environment family

### Isolated components

- support schema/tables
- support backend service
- support-specific migrations

### Support tables

The support service owns these tables in the support area:

- `forum_categories`
- `forum_topics`
- `forum_posts`
- `faqs`
- `ai_query_logs`
- `user_roles`

The key design principle is:

- marketplace business data is still owned by the original app
- support data is owned by the support service

This is why the support forum can read shared user and order context without taking over the main
application.

### pgvector

The AI search depends on vector embeddings. The `vector` extension must exist in PostgreSQL.

This was important during deployment because startup table creation failed if the extension had not
been created first. The backend startup was updated so it creates `vector` before support table
bootstrap.

Operational rule:

- if a future environment uses a fresh database, confirm `CREATE EXTENSION IF NOT EXISTS vector`
  runs before any embedding-backed table setup

---

## 6. Backend Scope

The support backend was intentionally trimmed down into a support-focused service.

### What it should own

- support topics
- support replies
- FAQ creation and editing
- AI suggestion endpoints
- admin support analytics
- category management
- support-side user/role management

### What it should not own

- marketplace ordering
- payments business flow
- product CRUD
- auction logic
- marketplace notifications beyond support-specific behavior

Future contributors should preserve this boundary. If support starts absorbing unrelated
marketplace logic again, the deployment will become harder to maintain and more dangerous to ship.

---

## 7. Auth and Roles

The support app uses the same Cognito identity source as the main app.

### User types used in the support frontend

- Customer
- Agent
- Admin

### Role enforcement

Roles are not only frontend labels. They are enforced in backend dependencies for protected routes.

Examples:

- customers can browse and post
- agents can answer and lock threads
- admins can manage analytics, categories, and user promotion workflows

The current support deployment also uses support-specific role handling rather than rewriting the
main marketplace role model.

This matters because future changes should avoid coupling support permissions directly to unrelated
marketplace roles unless the main app is deliberately redesigned around that.

---

## 8. Frontend Hosting and Environment Behavior

The support frontend is a Vite app. One deployment issue happened because the checked-in local
`.env` pointed to localhost, and production builds used that file when no production override
existed.

### Correct production behavior

Production builds must use:

- `VITE_API_URL=https://api.osomba.com/support-api/api/v1`
- real Cognito values, not placeholder local values

To make this stable, a dedicated `.env.production` file was added for the support frontend.

This is an important lesson for future contributors:

- do not assume `.env` is safe for production
- always verify the built JS bundle points to the real API before uploading it

---

## 9. Current Deployment Workflow

This is the practical deployment sequence currently used.

### Backend deploy

1. Update backend code
2. Build/deploy support backend to Elastic Beanstalk
3. Confirm the support environment is healthy
4. Confirm `https://api.osomba.com/support-api/health` works
5. Confirm support routes appear in the support backend OpenAPI output

### Frontend deploy

1. Build the Vite frontend
2. Confirm the built JS contains the production API URL, not localhost
3. Sync `frontend/build` to the S3 bucket
4. Invalidate CloudFront cache
5. Reload the public frontend URL and verify API-backed pages work

### Data deployment / seeding

If demo or seed content is needed:

1. Connect to the shared RDS database
2. Insert categories/topics/posts/faqs into the support area
3. Verify users referenced by those records exist in shared identity tables
4. Refresh the homepage and admin dashboards

---

## 10. Current Live Resources

This section is here so future contributors do not have to rediscover everything manually.

### Backend

- API domain: `https://api.osomba.com`
- Marketplace API base: `https://api.osomba.com/api/v1`
- Support API base: `https://api.osomba.com/support-api/api/v1`

### Support frontend

- Current CloudFront URL: `https://d8612cntnz17z.cloudfront.net`
- Planned vanity URL: `https://support.osomba.com`

### AWS resources

- EB application: `osomba_support`
- EB environment: `osomba-support-env`
- Target group: `osomba-support-shared-tg`
- Frontend S3 bucket: `osomba-support-frontend-prod-281505305629`
- CloudFront distribution: `E1K1SA4V13MTNM`
- Shared RDS host: `osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com`

---

## 11. DNS and Custom Domain Plan

The support frontend is intended to move from the raw CloudFront URL to a cleaner customer-facing
subdomain:

- `support.osomba.com`

Because the team uses GoDaddy for DNS, the setup has two pieces.

### Step A: ACM validation CNAME

AWS requests a certificate and GoDaddy must add the validation CNAME.

This record is only for certificate ownership validation.

### Step B: Public frontend CNAME

After the certificate is issued and attached to CloudFront, GoDaddy must point:

- `support` → `d8612cntnz17z.cloudfront.net`

That is what makes customers able to open `support.osomba.com`.

Important note:

The support backend does **not** need to move to `support.osomba.com`. Only the frontend should
live there. API requests should still go to:

- `https://api.osomba.com/support-api/api/v1`

This keeps backend and frontend responsibilities clean.

---

## 12. Known Operational Lessons

These are the deployment lessons that future team members should know.

### Lesson 1: Frontend env files matter

If the frontend is built with a localhost API URL, the site will load but all API-backed content
will fail in the browser. Always inspect the built JS bundle before upload if something seems off.

### Lesson 2: CloudFront cache can hide fixes

After deploying new frontend assets, invalidate CloudFront or the site may continue serving stale
JavaScript.

### Lesson 3: Browser success depends on CORS and auth together

An API may look healthy from curl but still fail in the browser if CORS, token handling, or
frontend env configuration is wrong. Always verify at both levels.

### Lesson 4: Shared RDS is useful but requires discipline

The support service benefits from shared user and marketplace context, but this only works if the
support service remains disciplined about what it owns and what it only reads.

### Lesson 5: Translation and AI features depend on AWS permissions

The live French translation behavior and AI search features depend on backend access to AWS
services such as Bedrock. If those permissions are missing, translation/search behavior may fail
or silently degrade.

---

## 13. Recommended Future Improvements

If the project continues after the thesis handoff, these would be the cleanest next improvements.

- Move the local development frontend variables out of `.env` into a dedicated `.env.development`
  so production mistakes become less likely
- Add a formal deployment checklist script or CI pipeline for frontend bundle validation
- Add backup/restore notes for the support schema specifically
- Add a staging support frontend URL before pushing changes to the production CloudFront
- Add CloudWatch alarms for support backend health and EB environment failures
- Add a small architecture diagram image or Mermaid diagram for onboarding docs

---

## 14. Final Summary

The final support deployment is intentionally a hybrid architecture:

- **separate frontend**
- **separate backend**
- **shared auth**
- **shared AWS RDS**
- **shared company domain**

That was the most practical solution for this project. It delivered a working customer care forum,
FAQ system, AI help board, and admin tooling without destabilizing the main Osomba production app.

For future teams, the most important thing to remember is this:

the support system is not a random side project anymore. It is a production-adjacent service with
its own frontend, backend, AWS resources, and deployment rules. Treat it like a real service, and
it will stay maintainable.
