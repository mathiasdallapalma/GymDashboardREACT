import uuid
from typing import Any

from app.security import get_password_hash, verify_password
from app.models.user import User, UserCreate, UserUpdate


def create_user(*, session: Any, user_create: UserCreate) -> User:
    """Create user in Firestore"""
    # Create user data with hashed password
    user_data = user_create.model_dump()
    user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
    user_data["id"] = str(uuid.uuid4())
    
    # Convert date to string if present
    if user_data.get("date_of_birth"):
        user_data["date_of_birth"] = str(user_data["date_of_birth"])
    
    # Add to Firestore
    users_ref = session.collection("users")
    doc_ref = users_ref.document(user_data["id"])
    doc_ref.set(user_data)
    
    # Return User object
    return User(**user_data)


def update_user(*, session: Any, db_user: User, user_in: UserUpdate) -> User:
    """Update user in Firestore"""
    user_data = user_in.model_dump(exclude_unset=True)
    
    # Handle password update
    if "password" in user_data:
        password = user_data.pop("password")
        user_data["hashed_password"] = get_password_hash(password)
    
    # Convert date to string if present
    if "date_of_birth" in user_data and user_data["date_of_birth"] is not None:
        user_data["date_of_birth"] = str(user_data["date_of_birth"])
    
    # Update in Firestore
    users_ref = session.collection("users")
    doc_ref = users_ref.document(db_user.id)
    doc_ref.update(user_data)
    
    # Get updated document
    updated_doc = doc_ref.get()
    updated_data = updated_doc.to_dict()
    updated_data["id"] = updated_doc.id
    
    return User(**updated_data)


def get_user_by_email(*, session: Any, email: str) -> User | None:
    """Get user by email from Firestore"""
    # Query the users collection where email equals the given value
    users_ref = session.collection("users")
    query = users_ref.where("email", "==", email).limit(1).stream()

    # Iterate over results (even if we expect only one)
    for doc in query:
        user_data = doc.to_dict()
        user_data["id"] = doc.id  # Add document ID
        
        # Handle date_of_birth conversion from string to date
        if "date_of_birth" in user_data and user_data["date_of_birth"]:
            try:
                from datetime import datetime
                if isinstance(user_data["date_of_birth"], str):
                    user_data["date_of_birth"] = datetime.strptime(user_data["date_of_birth"], "%Y-%m-%d").date()
            except (ValueError, TypeError):
                user_data["date_of_birth"] = None
                
        return User(**user_data)  # Convert dict to User model

    return None


def authenticate(*, session: Any, email: str, password: str) -> User | None:
    """Authenticate user with email and password"""
    print(f"Authenticating user with email: {email}")
    db_user = get_user_by_email(session=session, email=email)
    print(f"Retrieved user: {db_user}")
    
    if not db_user:
        print("User not found")
        return None
    
    print(f"Stored hash: {db_user.hashed_password}")
    print(f"Plain password: {password}")
    
    if not verify_password(password, db_user.hashed_password):
        print("Password verification failed")
        # Let's also test what hash we get for this password
        from app.security import get_password_hash
        new_hash = get_password_hash(password)
        print(f"Hash for '{password}' would be: {new_hash}")
        return None
    
    print("Password verification successful")
    return db_user