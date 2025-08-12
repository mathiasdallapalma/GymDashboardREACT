from collections.abc import Generator
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session, select

from app.config import settings
from app.database_engine import firestore_client
from app.models.user import User
from app.models.auth import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Any, None, None]:
    if settings.USE_FIREBASE:
        yield firestore_client
    else:
        from app.database_engine import engine
        with Session(engine) as session:
            yield session


SessionDep = Annotated[Any, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(db_client: SessionDep, token: TokenDep) -> User:
    print(f"get_current_user called with token: {token[:20]}..." if token else "No token")
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.SECURITY_ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        print(f"Token decoded successfully, user_id: {token_data.sub}")
    except (InvalidTokenError, ValidationError) as e:
        print(f"Token validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    if settings.USE_FIREBASE:
        print("Using Firebase for user lookup")
        # Firestore user lookup - use the client passed from get_db
        if not db_client:
            print("No Firestore client available")
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Get user document directly by document ID
        users_ref = db_client.collection("users")
        doc = users_ref.document(token_data.sub).get()
        
        print(f"Looking for document with ID: {token_data.sub}")
        
        if not doc.exists:
            print(f"User document not found in Firestore with id: {token_data.sub}")
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = doc.to_dict()
        user_data["id"] = doc.id  # Add the document ID as the id field
        user = User(**user_data)
        print(f"User found: {user.email}")
    else:
        print("Using PostgreSQL for user lookup")
        # PostgreSQL user lookup
        if not db_client:
            raise HTTPException(status_code=500, detail="Database session not available")
        
        user = db_client.get(User, token_data.sub)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_active:
        print(f"User {user.email} is not active")
        raise HTTPException(status_code=400, detail="Inactive user")
    
    print(f"Authentication successful for user: {user.email}")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.SECURITY_ALGORITHM]
        )
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None