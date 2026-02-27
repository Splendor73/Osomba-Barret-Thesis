import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_db
from app.core.config import settings

# Create an engine bound to the test database
# We use the same URL but wrap operations in transactions
engine = create_engine(settings.database_url)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def client():
    """
    Session-scoped TestClient.
    This ensures the app is initialized once.
    """
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="function")
def db_session():
    """
    Creates a new database session for a test.
    Wraps the test in a transaction and rolls it back at the end.
    Overrides the `get_db` dependency for the app so endpoints use this session.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # 1. Override the dependency so the app uses the transactional session
    def override_get_db():
        try:
            yield session
        finally:
            # We explicitly do NOT close the session here, 
            # because we want to reuse it and rollback later.
            pass

    app.dependency_overrides[get_db] = override_get_db

    # 2. Yield the session to the test function
    yield session

    # 3. Teardown: Rollback and close
    session.close()
    if transaction.is_active:
        transaction.rollback()
    connection.close()
    
    # Clear the override for clean slate
    app.dependency_overrides.clear()
