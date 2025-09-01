import random
import string

from fastapi.testclient import TestClient

from app.config import settings


def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))


def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"


def get_superuser_token_headers(client: TestClient) -> dict[str, str]:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    print(f"Attempting login with: {login_data}")
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    print(f"Login response status: {r.status_code}")
    print(f"Login response body: {r.text}")
    
    if r.status_code != 200:
        print("Login failed - this suggests password hash mismatch")
        return {}
    
    tokens = r.json()
    print(f"Superuser token: {tokens}")
    print(f"Data: {login_data}")
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers
