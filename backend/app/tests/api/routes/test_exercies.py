import uuid

from fastapi.testclient import TestClient

from app.config import settings


def test_create_exercise(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "title": "Foo", 
        "description": "Fighters",
        "category": "strength",
        "muscle_group": "chest",
        "difficulty": "easy",
        "duration": 300,
        "image_url": "https://example.com/image.jpg",
        "video_url": "https://example.com/video.mp4"
    }
    response = client.post(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_token_headers,
        json=data,
    )
    print("response")
    print(response.json())
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert content["category"] == data["category"]
    assert content["muscle_group"] == data["muscle_group"]
    assert content["difficulty"] == data["difficulty"]
    assert content["duration"] == data["duration"]
    assert content["image_url"] == data["image_url"]
    assert content["video_url"] == data["video_url"]
    assert "id" in content
    assert "owner_id" in content


def test_read_exercise(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # First create an exercise to read
    data = {
        "title": "Test Exercise", 
        "description": "Test Description",
        "category": "strength",
        "muscle_group": "chest",
        "difficulty": "easy",
        "duration": 300,
        "image_url": "https://example.com/image.jpg",
        "video_url": "https://example.com/video.mp4"
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_token_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_exercise = create_response.json()
    
    # Now read the exercise
    response = client.get(
        f"{settings.API_V1_STR}/exercises/{created_exercise['id']}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert content["id"] == created_exercise["id"]
    assert content["owner_id"] == created_exercise["owner_id"]


def test_read_exercise_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/exercises/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Exercise not found"


def test_read_exercise_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    # First create an exercise as superuser
    data = {
        "title": "Test Exercise", 
        "description": "Test Description",
        "category": "strength",
        "muscle_group": "chest",
        "difficulty": "easy",
        "duration": 300,
        "image_url": "https://example.com/image.jpg",
        "video_url": "https://example.com/video.mp4"
    }
    # Need superuser headers to create the exercise
    from app.tests.utils.utils import get_superuser_token_headers
    superuser_headers = get_superuser_token_headers(client)
    
    create_response = client.post(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_exercise = create_response.json()
    
    # Now try to read with normal user (should fail)
    response = client.get(
        f"{settings.API_V1_STR}/exercises/{created_exercise['id']}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_read_exercises(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # Create two exercises directly via API
    exercise_data = {
        "title": "Test Exercise 1", 
        "description": "Test Description 1",
        "category": "strength",
        "muscle_group": "chest",
        "difficulty": "easy",
        "duration": 300,
        "image_url": "https://example.com/image1.jpg",
        "video_url": "https://example.com/video1.mp4"
    }
    client.post(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_token_headers,
        json=exercise_data,
    )
    
    exercise_data["title"] = "Test Exercise 2"
    exercise_data["description"] = "Test Description 2"
    client.post(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_token_headers,
        json=exercise_data,
    )
    
    response = client.get(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2


def test_update_exercise(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # First create an exercise to update
    create_data = {
        "title": "Original title", 
        "description": "Original description",
        "category": "strength",
        "muscle_group": "chest",
        "difficulty": "easy",
        "duration": 300,
        "image_url": "https://example.com/image.jpg",
        "video_url": "https://example.com/video.mp4"
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_token_headers,
        json=create_data,
    )
    assert create_response.status_code == 200
    created_exercise = create_response.json()
    
    # Now update the exercise
    update_data = {
        "title": "Updated title", 
        "description": "Updated description",
        "category": "cardio",
        "muscle_group": "legs",
        "difficulty": "medium",
        "duration": 600,
        "image_url": "https://example.com/updated-image.jpg",
        "video_url": "https://example.com/updated-video.mp4"
    }
    response = client.put(
        f"{settings.API_V1_STR}/exercises/{created_exercise['id']}",
        headers=superuser_token_headers,
        json=update_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == update_data["title"]
    assert content["description"] == update_data["description"]
    assert content["category"] == update_data["category"]
    assert content["muscle_group"] == update_data["muscle_group"]
    assert content["difficulty"] == update_data["difficulty"]
    assert content["duration"] == update_data["duration"]
    assert content["image_url"] == update_data["image_url"]
    assert content["video_url"] == update_data["video_url"]
    assert content["id"] == created_exercise["id"]
    assert content["owner_id"] == created_exercise["owner_id"]


def test_update_exercise_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "title": "Updated title", 
        "description": "Updated description",
        "category": "flexibility",
        "muscle_group": "core",
        "difficulty": "hard",
        "duration": 900,
        "image_url": "https://example.com/updated-image.jpg",
        "video_url": "https://example.com/updated-video.mp4"
    }
    response = client.put(
        f"{settings.API_V1_STR}/exercises/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Exercise not found"


def test_update_exercise_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    # First create an exercise as superuser
    from app.tests.utils.utils import get_superuser_token_headers
    superuser_headers = get_superuser_token_headers(client)
    
    create_data = {
        "title": "Test Exercise", 
        "description": "Test Description",
        "category": "strength",
        "muscle_group": "chest",
        "difficulty": "easy",
        "duration": 300,
        "image_url": "https://example.com/image.jpg",
        "video_url": "https://example.com/video.mp4"
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_headers,
        json=create_data,
    )
    assert create_response.status_code == 200
    created_exercise = create_response.json()
    
    # Now try to update with normal user (should fail)
    data = {
        "title": "Updated title", 
        "description": "Updated description",
        "category": "balance",
        "muscle_group": "full_body",
        "difficulty": "easy",
        "duration": 450,
        "image_url": "https://example.com/updated-image.jpg",
        "video_url": "https://example.com/updated-video.mp4"
    }
    response = client.put(
        f"{settings.API_V1_STR}/exercises/{created_exercise['id']}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_exercise(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # First create an exercise to delete
    data = {
        "title": "Test Exercise", 
        "description": "Test Description",
        "category": "strength",
        "muscle_group": "chest",
        "difficulty": "easy",
        "duration": 300,
        "image_url": "https://example.com/image.jpg",
        "video_url": "https://example.com/video.mp4"
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_token_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_exercise = create_response.json()
    
    # Now delete the exercise
    response = client.delete(
        f"{settings.API_V1_STR}/exercises/{created_exercise['id']}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Exercise deleted successfully"


def test_delete_exercise_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/exercises/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Exercise not found"


def test_delete_exercise_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    # First create an exercise as superuser
    from app.tests.utils.utils import get_superuser_token_headers
    superuser_headers = get_superuser_token_headers(client)
    
    data = {
        "title": "Test Exercise", 
        "description": "Test Description",
        "category": "strength",
        "muscle_group": "chest",
        "difficulty": "easy",
        "duration": 300,
        "image_url": "https://example.com/image.jpg",
        "video_url": "https://example.com/video.mp4"
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/exercises/",
        headers=superuser_headers,
        json=data,
    )
    assert create_response.status_code == 200
    created_exercise = create_response.json()
    
    # Now try to delete with normal user (should fail)
    response = client.delete(
        f"{settings.API_V1_STR}/exercises/{created_exercise['id']}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"
