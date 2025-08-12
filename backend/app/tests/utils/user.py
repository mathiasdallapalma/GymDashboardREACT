from typing import Any

from fastapi.testclient import TestClient
from sqlmodel import Session


import app.crud.auth.user as crud
from app.config import settings
from app.models.user import User, UserCreate, UserUpdate
from app.tests.utils.utils import random_email, random_lower_string


def user_authentication_headers(
    *, client: TestClient, email: str, password: str
) -> dict[str, str]:
    data = {"username": email, "password": password}

    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=data)
    response = r.json()
    auth_token = response["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers


def create_random_user(db: Any) -> User:
    # Import here to avoid circular imports
    from app.database_engine import firestore_client
    import app.crud.auth.user as crud
    
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=firestore_client, user_create=user_in)
    return user


def authentication_token_from_email(
    *, client: TestClient, email: str, db: Any
) -> dict[str, str]:
    """
    Return a valid token for the user with given email.

    If the user doesn't exist it is created first.
    """
    # Import here to avoid circular imports
    from app.database_engine import firestore_client
    import app.crud.auth.user as crud
    
    # Use firestore_client instead of db session
    user = crud.get_user_by_email(session=firestore_client, email=email)
    if not user:
        # Create user with a known password
        password = "testpassword123"
        user_in_create = UserCreate(email=email, password=password)
        user = crud.create_user(session=firestore_client, user_create=user_in_create)
        return user_authentication_headers(client=client, email=email, password=password)
    else:
        # User exists, but we don't know the password. For tests, we'll use the default test password
        # This assumes the user was created in previous tests with this password
        return user_authentication_headers(client=client, email=email, password="testpassword123")
