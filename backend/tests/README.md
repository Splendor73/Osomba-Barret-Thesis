# Osomba Backend Test Suite

This directory contains the integration and unit tests for the Osomba Marketplace backend.

To ensure safe testing without polluting development or production AWS databases, **tests must be run against a dedicated local Postgres database.**

## 1. Prerequisites (One-time Setup)

Before running the test suite for the first time, you must initialize your local test database.

1. Ensure your local PostgreSQL server is running (e.g., via Postgres.app, Docker, or Homebrew).
2. Ensure your `backend/.env` file points to the local test database. It should look like this:

```env
# AWS credentials commented out...

POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=marketplace_test
```

3. Run the test database creation script from the `backend` directory:

```bash
conda activate osomba
python scripts/create_test_db.py
```

*Note: You do NOT need to run Alembic migrations on the test database. The test framework (`conftest.py`) will automatically create and drop all required tables based on your SQLAlchemy Models every time the test suite runs.*

### Viewing the Test Database in pgAdmin

To inspect the `marketplace_test` database and its tables locally:

1. Open **pgAdmin 4**.
2. If you don't already have a local server registered, right-click **Servers** > **Register** > **Server...**
   - **General Tab:** Name it (e.g., `Local Postgres`).
   - **Connection Tab:** 
     - **Host name/address:** `localhost`
     - **Port:** `5432`
     - **Maintenance database:** `postgres`
     - **Username:** `postgres` (or your local postgres username)
     - **Password:** `password` (or your local postgres password)
3. Click **Save**.
4. Expand your registered server in the strict hierarchy on the left.
5. Under **Databases**, you should now see `marketplace_test` (created by the script above).
6. To view the tables created by the tests, expand `marketplace_test` -> **Schemas** -> `public` -> **Tables**.

*Tip: Because `conftest.py` wraps tests in transactions and rolls them back, the test database will appear empty if a test is not actively running. If you want to see the table structures without running a test, simply run the test suite, and the framework will generate the tables (`Base.metadata.create_all`).*

## 2. Running Tests

Always run tests from within the `backend` directory with your Conda environment activated.

**To run the entire suite:**

```bash
conda activate osomba
pytest tests/
```

**To run a specific test file:**

```bash
pytest tests/test_api_auctions.py
```

**To see print statements (Debug output):**

```bash
pytest tests/ -s
```

## 3. How It Works (`conftest.py`)

The `tests/conftest.py` file is configured to:

1. Identify the database URL from your `.env` (which should be `marketplace_test`).
2. Create all tables (`Base.metadata.create_all`) for the duration of the test session.
3. For every individual test function, it starts a **Database Transaction**.
4. After the test completes (whether it passes or fails), it **rolls back the transaction**.

Because of this transactional approach, your database is swept clean instantly after every test, preventing state-leakage and keeping test runs blazing fast.
