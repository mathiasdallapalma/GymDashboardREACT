from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete

from app.config import settings
from app.database_engine import  firestore_client
from app.database import init_db
from app.main import app
from app.models.item import Item
from app.models.user import User
from app.tests.utils.user import authentication_token_from_email
from app.tests.utils.utils import get_superuser_token_headers


@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session | None, None, None]:
    if settings.USE_FIREBASE:
        # For Firestore, we don't use SQLModel sessions
        init_db()
        yield None
        # Cleanup Firestore collections if needed
        if firestore_client:
            # Delete test data from Firestore collections
            try:
                # Delete items collection
                items_ref = firestore_client.collection("items")
                docs = items_ref.stream()
                for doc in docs:
                    doc.reference.delete()
                
                # Delete users collection (except superuser)
                users_ref = firestore_client.collection("users")
                docs = users_ref.where("email", "!=", settings.FIRST_SUPERUSER).stream()
                for doc in docs:
                    doc.reference.delete()
            except Exception as e:
                print(f"Error cleaning up Firestore: {e}")
    


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session | None) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )
