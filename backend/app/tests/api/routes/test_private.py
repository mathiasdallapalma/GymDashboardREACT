from fastapi.testclient import TestClient

from app.config import settings


def test_create_user(client: TestClient, db) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/",
        json={
            "email": "pollo@listo.com",
            "password": "password123",
            "full_name": "Pollo Listo",
        },
    )

    assert r.status_code == 200

    data = r.json()

    # Verify user was created in Firestore
    from app.database_engine import firestore_client
    users_ref = firestore_client.collection("users")
    doc = users_ref.document(data["id"]).get()
    
    assert doc.exists
    user_data = doc.to_dict()
    assert user_data["email"] == "pollo@listo.com"
    assert user_data["full_name"] == "Pollo Listo"
