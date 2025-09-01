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
        
        # Backup initial state before tests
        initial_state = {}
        if firestore_client:
            try:
                # Backup items collection
                items_ref = firestore_client.collection("items")
                items_docs = items_ref.stream()
                initial_state["items"] = []
                for doc in items_docs:
                    item_data = doc.to_dict()
                    item_data["id"] = doc.id
                    initial_state["items"].append(item_data)
                
                # Backup users collection
                users_ref = firestore_client.collection("users")
                users_docs = users_ref.stream()
                initial_state["users"] = []
                for doc in users_docs:
                    user_data = doc.to_dict()
                    user_data["id"] = doc.id
                    initial_state["users"].append(user_data)
                
                # Backup activities collection
                activities_ref = firestore_client.collection("activities")
                activities_docs = activities_ref.stream()
                initial_state["activities"] = []
                for doc in activities_docs:
                    activity_data = doc.to_dict()
                    activity_data["id"] = doc.id
                    initial_state["activities"].append(activity_data)
                
                # Backup exercises collection
                exercises_ref = firestore_client.collection("exercises")
                exercises_docs = exercises_ref.stream()
                initial_state["exercises"] = []
                for doc in exercises_docs:
                    exercise_data = doc.to_dict()
                    exercise_data["id"] = doc.id
                    initial_state["exercises"].append(exercise_data)
                    
            except Exception as e:
                print(f"Error backing up Firestore state: {e}")
                initial_state = {}
        
        yield None
        
        # Restore initial state after tests
        if firestore_client and initial_state:
            try:
                # Clear all collections first
                collections_to_clear = ["items", "users", "activities", "exercises"]
                for collection_name in collections_to_clear:
                    collection_ref = firestore_client.collection(collection_name)
                    docs = collection_ref.stream()
                    for doc in docs:
                        doc.reference.delete()
                
                # Restore backed up data
                for collection_name, documents in initial_state.items():
                    collection_ref = firestore_client.collection(collection_name)
                    for doc_data in documents:
                        doc_id = doc_data.pop("id")  # Remove id from data
                        collection_ref.document(doc_id).set(doc_data)
                        
            except Exception as e:
                print(f"Error restoring Firestore state: {e}")
    


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
