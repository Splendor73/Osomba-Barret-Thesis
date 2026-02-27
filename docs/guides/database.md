# Database Migrations with Alembic

Alembic is the database migration tool for SQLAlchemy used in the Osomba Marketplace backend. It provides a robust mechanism for tracking, versioning, and applying schema changes across local development and AWS production environments.

## 1. Directory Structure

- `backend/alembic/`: Configuration and migration environment.
- `backend/alembic/versions/`: The authoritative revision history (individual Python scripts for each schema change).
- `backend/alembic.ini`: Global settings and database connection configuration.

## 2. Common Commands

All commands should be executed from the `backend/` directory with `PYTHONPATH=.` set.

| Action | Command |
| :--- | :--- |
| **Check Current Version** | `alembic current` |
| **Generate Migration** | `alembic revision --autogenerate -m "description"` |
| **Apply Migration** | `alembic upgrade head` |
| **Rollback Last Change** | `alembic downgrade -1` |
| **View History** | `alembic history --verbose` |

## 3. Standard Workflow

### Step 1: Update Models
Modify the SQLAlchemy models in `backend/app/models/` (e.g., adding a new column to `user.py`).

### Step 2: Generate Revision
Alembic compares your Python models against the current database schema to generate a migration script.
```bash
PYTHONPATH=. venv/bin/alembic revision --autogenerate -m "Add phone_number to users"
```
*Note: Always review the generated script in `alembic/versions/` before applying it to ensure accuracy.*

### Step 3: Apply Changes
Apply the migration to your target database. This requires an active SSH tunnel if targeting the AWS RDS instance.
```bash
PYTHONPATH=. venv/bin/alembic upgrade head
```

## 4. Production Deployment (AWS)

Osomba utilizes an automated migration strategy within the AWS Elastic Beanstalk lifecycle:

- **Automated Execution**: A configuration in `.ebextensions/` triggers `alembic upgrade head` during the deployment process.
- **Consistency**: This ensures the RDS schema is always synchronized with the deployed application code without requiring manual SQL execution or SSH access to production instances.

## 5. Troubleshooting

- **`Target database is not up to date`**: Indicates pending migrations. Run `alembic upgrade head` to synchronize.
- **Merge Conflicts**: If concurrent branches create migrations, manually reconcile the `down_revision` pointers in the scripts to restore a linear history.
- **SQL Preview**: To generate the raw SQL without executing it, use `alembic upgrade head --sql`.

---
*Last Updated: February 2026*
