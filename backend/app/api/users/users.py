import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, delete, func, select

from app.crud.auth import user as crud_user
from app.utils.auth import CurrentUser, SessionDep, get_current_active_superuser

from app.config import settings
from app.security import get_password_hash, verify_password
from app.models.item import Item
from app.models.message import Message
from app.models.user import (
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)



from app.utils.email import generate_new_account_email, send_email

router = APIRouter(tags=["users"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """

    if not session:
        raise HTTPException(status_code=500, detail="Database not available")

    users_ref = session.collection("users")

    # Firestore has no offset, so fetch skip + limit, then slice
    docs = list(users_ref.limit(skip + limit).stream())
    users_docs = docs[skip:]

    all_docs = list(users_ref.stream())
    count = len(all_docs)

    users = []
    for doc in users_docs:
        user_data = doc.to_dict()
        user_data["id"] = doc.id
        users.append(UserPublic(**user_data))

    return UsersPublic(data=users, count=count)



@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    print(f"session: {session}")
    print(f"user_in: {user_in}")
    user = crud_user.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = crud_user.create_user(session=session, user_create=user_in)
    if settings.emails_enabled and user_in.email:
        email_data = generate_new_account_email(
            email_to=user_in.email, username=user_in.email, password=user_in.password
        )
        send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """
    users_ref = session.collection("users")

    if user_in.email:
        # Check if email already exists for another user
        query = users_ref.where("email", "==", user_in.email).stream()
        for doc in query:
            if doc.id != str(current_user.id):
                raise HTTPException(
                    status_code=409, detail="User with this email already exists"
                )
                break

    user_data = user_in.model_dump(exclude_unset=True)
    user_doc_ref = users_ref.document(str(current_user.id))

    # Update user document with new data
    user_doc_ref.update(user_data)

    # Fetch updated document to return fresh data
    updated_doc = user_doc_ref.get()
    updated_user_data = updated_doc.to_dict()
    updated_user_data["id"] = updated_doc.id

    return UserPublic(**updated_user_data)



@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    # Verify current password
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    # Prevent same password reuse
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )

    # Hash and update
    hashed_password = get_password_hash(body.new_password)
    users_ref = session.collection("users").document(str(current_user.id))
    users_ref.update({"hashed_password": hashed_password})

    return Message(message="Password updated successfully")


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user = crud_user.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user = crud_user.create_user(session=session, user_create=user_create)
    return user


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: str, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    # Get user from Firestore
    users_ref = session.collection("users")
    doc = users_ref.document(user_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = doc.to_dict()
    user_data["id"] = doc.id
    user = User(**user_data)
    
    if user.id == current_user.id:
        return user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    return user


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """

    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = crud_user.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    db_user = crud_user.update_user(session=session, db_user=db_user, user_in=user_in)
    return db_user


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    statement = delete(Item).where(col(Item.owner_id) == user_id)
    session.exec(statement)  # type: ignore
    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")
