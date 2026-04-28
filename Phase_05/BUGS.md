# Bug Tracker

## Active Bugs

### BUG-004: Local Alembic history points to missing revision
- **Severity:** Medium
- **Location:** `backend/alembic_version` local database state
- **Description:** `alembic upgrade head` cannot run against the current local database because `alembic_version` is stamped with revision `e8b7f84f02d1`, but no matching migration file exists in the repo.
- **Steps to Reproduce:**
  1. Run `PYTHONPATH=. ./venv/bin/alembic upgrade head` from `backend`.
  2. Observe Alembic fail before applying new migrations.
- **Expected Behavior:** Alembic can locate the current revision and apply pending migrations.
- **Actual Behavior:** Alembic exits with `Can't locate revision identified by 'e8b7f84f02d1'`.
- **Root Cause:** The local database migration stamp references a migration that is not present in this checkout.
- **Suggested Fix:** Recover the missing migration file or intentionally restamp the local database after confirming the schema matches the repo migrations.
- **Status:** Open

## Resolved Bugs

### BUG-003: Agent role is accepted by backend code but missing from database enum
- **Severity:** High
- **Location:** `backend/app/models/user.py`, `backend/app/api/v1/endpoints/admin.py`, `backend/alembic/versions/c91f8d4b2a6c_add_agent_role_to_userrole_enum.py`
- **Description:** Backend authorization and admin role update code supports an `agent` role, but the PostgreSQL `userrole` enum did not include `agent`.
- **Steps to Reproduce:**
  1. Run forum tests that persist a support agent user.
  2. Observe PostgreSQL reject `role='agent'`.
- **Expected Behavior:** Agent users can be persisted and then used by support endpoints.
- **Actual Behavior:** PostgreSQL rejects the role with `invalid input value for enum userrole: "agent"`.
- **Root Cause:** The model/application role list and database enum migration were out of sync.
- **Suggested Fix:** Add an Alembic migration that adds `agent` to the `userrole` enum.
- **Status:** Fixed

### BUG-002: User inserts fail because model omits non-null account columns
- **Severity:** High
- **Location:** `backend/app/models/user.py`
- **Description:** Backend tests that create users fail before reaching support endpoints because SQLAlchemy inserts omit database-required account columns.
- **Steps to Reproduce:**
  1. Run `PYTHONPATH=. ./venv/bin/pytest tests/test_api_forum.py -q`.
  2. Observe fixture setup failing during user insert.
- **Expected Behavior:** Test and runtime user inserts should provide all required non-null user columns.
- **Actual Behavior:** PostgreSQL rejects the insert with non-null violations such as `is_verified` and `is_banned`.
- **Root Cause:** The database schema includes account verification and moderation fields that `backend/app/models/user.py` did not map.
- **Suggested Fix:** Add the missing verification, business verification, and ban fields to the `User` model with defaults matching the database intent.
- **Status:** Verified

### BUG-001: Support redirects can point to main Osomba site
- **Severity:** High
- **Location:** `frontend/src/components/Header.tsx`, `backend/app/api/v1/endpoints/forum.py`
- **Description:** Some navigation/link paths mixed the support frontend with the main Osomba marketplace domain.
- **Steps to Reproduce:**
  1. Use the support app header logo.
  2. Trigger support flows that generate a thread link, such as official answer notifications.
- **Expected Behavior:** The logo can intentionally open the main Osomba marketplace, but support-home/thread redirects should stay on the support frontend.
- **Actual Behavior:** Backend-generated thread links used `https://osomba.com/thread/...`, which sends users to the main site instead of the support site.
- **Root Cause:** Main marketplace and support frontend URLs were not separated in code.
- **Suggested Fix:** Keep the main logo URL explicit in the header and generate support thread links from a dedicated `SUPPORT_FRONTEND_URL` setting.
- **Status:** Verified
