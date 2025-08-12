import uuid

from fastapi.testclient import TestClient

from app.config import settings


def test_create_item(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": "Foo", "description": "Fighters"}
    response = client.post(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert "id" in content
    assert "owner_id" in content


def test_read_item(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # First create an item to read
    data = {"title": "Test Item", "description": "Test Description"}
    create_response = client.post(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_token_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_item = create_response.json()
    
    # Now read the item
    response = client.get(
        f"{settings.API_V1_STR}/items/{created_item['id']}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert content["id"] == created_item["id"]
    assert content["owner_id"] == created_item["owner_id"]


def test_read_item_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/items/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_read_item_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    # First create an item as superuser
    from app.tests.utils.utils import get_superuser_token_headers
    superuser_headers = get_superuser_token_headers(client)
    
    data = {"title": "Test Item", "description": "Test Description"}
    create_response = client.post(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_item = create_response.json()
    
    # Now try to read with normal user (should fail)
    response = client.get(
        f"{settings.API_V1_STR}/items/{created_item['id']}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_read_items(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # Create two items directly via API
    item_data = {"title": "Test Item 1", "description": "Test Description 1"}
    client.post(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_token_headers,
        json=item_data,
    )
    
    item_data["title"] = "Test Item 2"
    item_data["description"] = "Test Description 2"
    client.post(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_token_headers,
        json=item_data,
    )
    
    response = client.get(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2


def test_update_item(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # First create an item to update
    create_data = {"title": "Original Title", "description": "Original Description"}
    create_response = client.post(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_token_headers,
        json=create_data,
    )
    assert create_response.status_code == 200
    created_item = create_response.json()
    
    # Now update the item
    update_data = {"title": "Updated Title", "description": "Updated Description"}
    response = client.put(
        f"{settings.API_V1_STR}/items/{created_item['id']}",
        headers=superuser_token_headers,
        json=update_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == update_data["title"]
    assert content["description"] == update_data["description"]
    assert content["id"] == created_item["id"]
    assert content["owner_id"] == created_item["owner_id"]


def test_update_item_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": "Updated title", "description": "Updated description"}
    response = client.put(
        f"{settings.API_V1_STR}/items/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_update_item_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    # First create an item as superuser
    from app.tests.utils.utils import get_superuser_token_headers
    superuser_headers = get_superuser_token_headers(client)
    
    create_data = {"title": "Test Item", "description": "Test Description"}
    create_response = client.post(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_headers,
        json=create_data,
    )
    assert create_response.status_code == 200
    created_item = create_response.json()
    
    # Now try to update with normal user (should fail)
    data = {"title": "Updated title", "description": "Updated description"}
    response = client.put(
        f"{settings.API_V1_STR}/items/{created_item['id']}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_item(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # First create an item to delete
    data = {"title": "Test Item", "description": "Test Description"}
    create_response = client.post(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_token_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_item = create_response.json()
    
    # Now delete the item
    response = client.delete(
        f"{settings.API_V1_STR}/items/{created_item['id']}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Item deleted successfully"


def test_delete_item_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/items/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_delete_item_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    # First create an item as superuser
    from app.tests.utils.utils import get_superuser_token_headers
    superuser_headers = get_superuser_token_headers(client)
    
    data = {"title": "Test Item", "description": "Test Description"}
    create_response = client.post(
        f"{settings.API_V1_STR}/items/",
        headers=superuser_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_item = create_response.json()
    
    # Now try to delete with normal user (should fail)
    response = client.delete(
        f"{settings.API_V1_STR}/items/{created_item['id']}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"
