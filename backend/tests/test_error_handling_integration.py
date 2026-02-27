from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.api.dependencies import get_product_service
from app.core.exceptions import NotFoundException, PermissionDeniedException

client = TestClient(app)

def test_not_found_exception_handler():
    # Override dependency to raise exception
    mock_service = MagicMock()
    mock_service.get_product.side_effect = NotFoundException("Item not found")
    
    app.dependency_overrides[get_product_service] = lambda: mock_service
    
    response = client.get("/api/v1/products/999")
    
    assert response.status_code == 404
    assert response.json() == {"detail": "Item not found"}
    
    app.dependency_overrides = {}

def test_permission_denied_exception_handler():
    mock_service = MagicMock()
    mock_service.create_product.side_effect = PermissionDeniedException("Not allowed")
    
    app.dependency_overrides[get_product_service] = lambda: mock_service
    
    # We also need to override current_user to bypass auth
    app.dependency_overrides["get_current_user"] = lambda: MagicMock(user_id=1) 
    # Actually, the dependency is `get_current_user` function object
    from app.api.dependencies import get_current_user
    app.dependency_overrides[get_current_user] = lambda: MagicMock(user_id=1)

    response = client.post("/api/v1/products/", json={
        "title": "Test", 
        "description": "Desc", 
        "price": 10, 
        "quantity": 1
    })
    
    assert response.status_code == 403
    assert response.json() == {"detail": "Not allowed"}
    
    app.dependency_overrides = {}
