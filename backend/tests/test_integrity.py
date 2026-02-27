import pytest
from app.main import app

def test_health(client):
    """
    Verify the health endpoint is reachable.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_router_registration():
    """
    Verify critical API routes are registered in the FastAPI app.
    """
    routes = [route.path for route in app.routes]
    expected_routes = [
        "/api/v1/auth/me",
        "/api/v1/products/",
        "/api/v1/auctions/",
        "/api/v1/orders/"
    ]
    for route in expected_routes:
        assert route in routes, f"Route {route} not found in app routes"
