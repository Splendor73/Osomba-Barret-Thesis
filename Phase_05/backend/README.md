# Osomba Support Backend

Separate FastAPI backend for the Osomba Support experience.

## Production role

This backend is deployed separately from the main marketplace backend, but it shares:

- the main Osomba Cognito user pool
- the main Osomba RDS PostgreSQL instance
- the shared `users` table
- the shared production API domain under `/support-api`

Production support API:

- `https://api.osomba.com/support-api/api/v1`

## What this service owns

- public support forum reads
- FAQ reads and management
- AI help and support search
- report / moderation workflow
- support-side block and unblock flows
- support analytics, reported-content review, and user review

## Shared database contract

Support data lives in the shared PostgreSQL database under the `support` schema.

Important handoff rule:

- this repo owns the **support runtime**
- the **main marketplace repo** owns the shared production Alembic migration chain

If support schema changes are introduced here, the production RDS migration must still be added to the main marketplace repository before live rollout.

## Main support tables

- `support.user_roles`
- `support.forum_categories`
- `support.forum_topics`
- `support.forum_posts`
- `support.faqs`
- `support.ai_query_logs`
- `support.reported_content`

## Current production behavior

- FAQ, forum list, thread detail, search, and filters are public
- posting, replying, and reporting require authentication
- moderation is available to agents and admins
- deleted support content is soft-deleted first
- blocked users can still read support publicly, but cannot write
- block and unblock actions send SES email notifications
- cleanup is handled by the deployed postdeploy cron registration in `.platform/hooks/postdeploy/02_register_support_cleanup.sh`

## Deployment topology

Backend hosting:

- Elastic Beanstalk application: `osomba_support`
- Elastic Beanstalk environment: `osomba-support-env`

Routing:

- Application Load Balancer forwards `/support-api/*` to this backend

Shared auth:

- User Pool ID: `us-east-1_vf5HVszbN`
- App Client ID: `513m3vscibhska2jie3ganrcn9`

Shared database:

- RDS host: `osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com`
- schema: `support`

## Local development

```bash
cd Phase_05/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Required local env:

- `POSTGRES_SERVER`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `AWS_REGION`
- `COGNITO_USER_POOL_ID`
- `COGNITO_APP_CLIENT_ID`
- `SES_FROM_EMAIL`
- `SUPPORT_DB_SCHEMA`
- `SUPPORT_FRONTEND_URL`

## Deployment notes

- `.ebextensions/` contains EB platform sizing and cleanup config
- `.platform/hooks/prebuild/01_repair_pip.sh` repairs pip on EB during build
- `.platform/hooks/postdeploy/02_register_support_cleanup.sh` registers the daily soft-delete purge job
- `.ebignore` excludes local files like `.env`, caches, and logs from deployment bundles

## Verification checklist

After deploy, verify:

- `https://api.osomba.com/support-api/health`
- guest can browse support without login
- authenticated user can post and reply
- report flow works
- moderation queue works
- block and unblock emails send
- deleted items disappear from public reads
- cleanup cron is present on the EB instance
