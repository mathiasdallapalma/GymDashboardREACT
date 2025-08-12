from google.cloud import firestore
from sqlmodel import Session
from app.config import settings
from app.models.user import User, UserCreate
from app.database_engine import firestore_client
from app.security import get_password_hash

import app.crud.auth.user as crud

# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session = None) -> None:
    if settings.USE_FIREBASE:
        # Firestore initialization
        if not firestore_client:
            raise Exception("Firestore client not initialized")
        
        # Reference to the users collection
        users_ref = firestore_client.collection("users")

        # Check if the superuser already exists
        query = users_ref.where("email", "==", settings.FIRST_SUPERUSER).limit(1)
        results = list(query.stream())
        superuser_exists = len(results) > 0

        if not superuser_exists:
            # Create the superuser document with hashed password
            user_in = UserCreate(
                email=settings.FIRST_SUPERUSER,
                password=settings.FIRST_SUPERUSER_PASSWORD,
                is_superuser=True,
            )
            # Hash the password before storing in Firestore
            
            user_data = user_in.dict()
            user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
            
            users_ref.add(user_data)
            print(f"Superuser {settings.FIRST_SUPERUSER} created in Firestore.")
        else:
            print(f"Superuser {settings.FIRST_SUPERUSER} already exists in Firestore.")
   