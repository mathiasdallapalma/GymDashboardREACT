import uuid

from fastapi.testclient import TestClient

from app.config import settings


def test_create_activity(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "title": "Foo", 
        "exercises": ["ex1", "ex2"],
        "user_id":"userid"
        
    }
    response = client.post(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_token_headers,
        json=data,
    )
    print("response")
    print(response.json())
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["exercises"] == data["exercises"]
    assert "id" in content
    assert "user_id" in content


def test_read_activity(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # First create an activity to read
    data = {
        "title": "Test Activity", 
        "exercises": ["ex1", "ex2"],
        "user_id":"user_id"
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_token_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_activity = create_response.json()
    
    # Now read the activity
    response = client.get(
        f"{settings.API_V1_STR}/activities/{created_activity['id']}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["exercises"] == data["exercises"]
    assert content["id"] == created_activity["id"]
    assert content["user_id"] == data["user_id"]


def test_read_activity_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/activities/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Activity not found"


def test_read_activity_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    # First create an activity as superuser
    data = {
        "title": "Test Activity", 
        "exercises": ["ex1", "ex2"],
        "user_id":"user_id"
    }
    # Need superuser headers to create the activity
    from app.tests.utils.utils import get_superuser_token_headers
    superuser_headers = get_superuser_token_headers(client)
    
    create_response = client.post(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_activity = create_response.json()
    
    # Now try to read with normal user (should fail)
    response = client.get(
        f"{settings.API_V1_STR}/activities/{created_activity['id']}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_read_activities(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # Create two activities directly via API
    activity_data = {
        "title": "Test Activity 1", 
        "exercises": ["ex1", "ex2"],
        "user_id":"user_id"
    }
    response1 = client.post(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_token_headers,
        json=activity_data,
    )
    assert response1.status_code == 200
    created_activity1 = response1.json()
    
    activity_data["title"] = "Test Activity 2"
    response2 = client.post(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_token_headers,
        json=activity_data,
    )
    assert response2.status_code == 200
    created_activity2 = response2.json()
    
    # Test getting all activities (superuser)
    response = client.get(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2
    for act in content["data"]:
        assert isinstance(act["exercises"], list)
        for eid in act["exercises"]:
            assert isinstance(eid, str)
    
    # Test getting activities for specific user
    user_id = activity_data["user_id"]
    response = client.get(
        f"{settings.API_V1_STR}/activities/?user_id={user_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2
    # All activities should belong to the specified user
    for act in content["data"]:
        assert act["user_id"] == user_id


def test_update_activity(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # First create an activity to update
    create_data = {
        "title": "Original title", 
        "exercises": ["ex1", "ex2"],
        "user_id":"user_id"
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_token_headers,
        json=create_data,
    )
    assert create_response.status_code == 200
    created_activity = create_response.json()
    
    # Now update the activity
    update_data = {
        "title": "Updated title", 
        "exercises": ["ex3", "ex4"],
        "user_id":"user_id"
        
    }
    response = client.put(
        f"{settings.API_V1_STR}/activities/{created_activity['id']}",
        headers=superuser_token_headers,
        json=update_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == update_data["title"]
    assert content["exercises"] == update_data["exercises"]
    assert content["id"] == created_activity["id"]
    assert content["user_id"] == created_activity["user_id"]


def test_update_activity_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "title": "Updated title", 
        "exercises": ["ex3", "ex4"],
        "user_id":"user_id"
    }
    response = client.put(
        f"{settings.API_V1_STR}/activities/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Activity not found"


def test_update_activity_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    # First create an activity as superuser
    from app.tests.utils.utils import get_superuser_token_headers
    superuser_headers = get_superuser_token_headers(client)
    
    create_data = {
        "title": "Test Activity", 
        "exercises": ["ex1", "ex2"],
        "user_id":"user_id"
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_headers,
        json=create_data,
    )
    assert create_response.status_code == 200
    created_activity = create_response.json()
    
    # Now try to update with normal user (should fail)
    data = {
        "title": "Updated title", 
        "exercises": ["ex3", "ex4"],
        "user_id":"user_id"
    }
    response = client.put(
        f"{settings.API_V1_STR}/activities/{created_activity['id']}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_activity(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # First create an activity to delete
    data = {
        "title": "Test Activity", 
        "exercises": ["ex1", "ex2"],
        "user_id":"user_id"
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_token_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_activity = create_response.json()
    
    # Now delete the activity
    response = client.delete(
        f"{settings.API_V1_STR}/activities/{created_activity['id']}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Activity deleted successfully"


def test_delete_activity_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/activities/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Activity not found"


def test_delete_activity_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    # First create an activity as superuser
    from app.tests.utils.utils import get_superuser_token_headers
    superuser_headers = get_superuser_token_headers(client)
    
    data = {
        "title": "Test Activity", 
        "exercises": ["ex1", "ex2"],
        "user_id":"user_id"
        
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/activities/",
        headers=superuser_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_activity = create_response.json()
    
    # Now try to delete with normal user (should fail)
    response = client.delete(
        f"{settings.API_V1_STR}/activities/{created_activity['id']}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"
