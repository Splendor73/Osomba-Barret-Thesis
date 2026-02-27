# End-to-End Development Workflow: Osomba Marketplace

This document provides a consolidated, step-by-step guide for the complete development lifecycle of the Osomba Marketplace backend, including database connectivity, testing, and running the application locally.

---

## 1. Prerequisites & Setup

### Environment Requirements
- **Python 3.12+**
- **Virtual Environment** (already set up in `.venv/`)
- **SSH Key:** `osomba-marketplace-key.pem` (must be in the project root or specified path)

### Initial Installation
If you haven't already, install the backend dependencies:
```bash
cd backend
../.venv/bin/pip install -r requirements.txt
# Ensure httpx is installed for testing
../.venv/bin/pip install httpx
```

---

## 2. Secure Database Connectivity (RDS via SSH Tunnel)

The RDS database is hosted in a private AWS subnet. To connect locally, you **must** establish an SSH tunnel through the Bastion/Management EC2 instance.

### Step 1: Start the SSH Tunnel
Run this command in a dedicated terminal window and keep it open:
```bash
ssh -i osomba-marketplace-key.pem 
    -L 5433:osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com:5432 
    ec2-user@54.152.166.203 -N
```
- **Local Port:** `5433` (This is what your local apps will connect to)
- **Remote Endpoint:** `osomba-marketplace-db...:5432`
- **Bastion Host:** `54.152.166.203`

### Step 2: Configure Local Environment Variables
Create or update your `backend/.env` file to point to the tunnel:
```env
POSTGRES_SERVER=localhost
POSTGRES_PORT=5433
POSTGRES_USER=Osomba_db
POSTGRES_PASSWORD=Osomba2026!
POSTGRES_DB=postgres
```

---

## 3. Running Automated Tests

Tests use an in-memory SQLite database by default to ensure isolation and speed, but they still require the `Settings` object to be valid.

### Run All Tests
From the `backend/` directory:
```bash
cd backend
PYTHONPATH=. ../.venv/bin/pytest
```

### Run Specific Test Files
Example for product tests:
```bash
PYTHONPATH=. ../.venv/bin/pytest tests/test_products.py
```

---

## 4. Running the Application Locally

Once the SSH tunnel is active and your `.env` is configured, you can start the FastAPI server.

### Start the Server
From the `backend/` directory:
```bash
cd backend
PYTHONPATH=. ../.venv/bin/uvicorn app.main:app --reload --port 8000
```

### Verify Connection
1. **Health Check:** Open `http://localhost:8000/health` in your browser.
2. **API Documentation:** Visit `http://localhost:8000/docs` to see the interactive Swagger UI.

---

## 5. Database Migrations (Alembic)

When you modify models in `app/models/`, you must generate and apply migrations.

### Create a New Migration
```bash
cd backend
PYTHONPATH=. ../.venv/bin/alembic revision --autogenerate -m "description of changes"
```

### Apply Migrations to RDS (via Tunnel)
Ensure the SSH tunnel is running and `.env` points to `localhost:5433`:
```bash
cd backend
PYTHONPATH=. ../.venv/bin/alembic upgrade head
```

---

## 6. Common Workflow Summary

| Action | Command (from `backend/`) |
|--------|---------------------------|
| **Connect to DB** | `ssh -i ... -L 5433:...:5432 ... -N` (Separate terminal) |
| **Run Tests** | `PYTHONPATH=. ../.venv/bin/pytest` |
| **Start Server** | `PYTHONPATH=. ../.venv/bin/uvicorn app.main:app --reload` |
| **Migrate DB** | `PYTHONPATH=. ../.venv/bin/alembic upgrade head` |

---

## 7. Troubleshooting

- **ModuleNotFoundError: No module named 'app'**: Ensure you are running commands from the `backend/` directory and have `PYTHONPATH=.` set.
- **Connection Refused (DB)**: Ensure the SSH tunnel is active and you are using port `5433` in your `.env`.
- **TypeError in Tests**: Ensure mock objects in `tests/` match the latest SQLAlchemy models in `app/models/`.
