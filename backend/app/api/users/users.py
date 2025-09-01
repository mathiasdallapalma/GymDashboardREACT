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
    UpdateExercisePerformanceRequest,
)


from app.utils.email import generate_new_account_email, send_email

router = APIRouter(tags=["users"])


@router.get(
    "/",
    response_model=UsersPublic,
)
def read_users(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve users.
    """

    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    # Only allow superuser or trainer
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "trainer"):
        raise HTTPException(status_code=403, detail="Not enough privileges")


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
    "/", response_model=UserPublic
)
def create_user(*, session: SessionDep, current_user: CurrentUser, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    print(f"Creating user with email: {user_in.email}")
      # Only allow superuser or trainer
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "trainer"):
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    # Check if user already exists
    user = crud_user.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = crud_user.create_user(session=session, user_create=user_in)
    print(f"User created successfully: {user.id}")
    
    # Send email if enabled
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
    
    # Convert date to string if present
    if "date_of_birth" in user_data and user_data["date_of_birth"] is not None:
        user_data["date_of_birth"] = str(user_data["date_of_birth"])
    
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
    
    # Delete user's items from Firestore
    items_ref = session.collection("items")
    user_items = items_ref.where("owner_id", "==", current_user.id).stream()
    for item_doc in user_items:
        item_doc.reference.delete()
    
    # Delete the user document
    users_ref = session.collection("users")
    users_ref.document(current_user.id).delete()
    
    return Message(message="User deleted successfully")




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
    # Allow self, superuser, or trainer
    if user.id == current_user.id:
        return user
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "trainer"):
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
    user_id: str,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """
    # Get user from Firestore
    users_ref = session.collection("users")
    doc = users_ref.document(user_id).get()

    if not doc.exists:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    
    # Get current user data
    user_data = doc.to_dict()
    user_data["id"] = doc.id
    db_user = User(**user_data)
    
    # Check email uniqueness if email is being updated
    if user_in.email:
        existing_user = crud_user.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    # Update user using Firestore
    updated_user = crud_user.update_user(session=session, db_user=db_user, user_in=user_in)
    return updated_user


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: str
) -> Message:
    """
    Delete a user.
    """
    # Get user from Firestore
    users_ref = session.collection("users")
    doc = users_ref.document(user_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user data
    user_data = doc.to_dict()
    user_data["id"] = doc.id
    user = User(**user_data)
    
    # Check if trying to delete themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    
    # Delete user's items from Firestore (if you have items collection)
    items_ref = session.collection("items")
    user_items = items_ref.where("owner_id", "==", user_id).stream()
    for item_doc in user_items:
        item_doc.reference.delete()
    
    # Delete the user document
    users_ref.document(user_id).delete()
    
    return Message(message="User deleted successfully")


@router.patch("/me/exercise-performance", response_model=Message)
def update_exercise_performance(
    *, 
    session: SessionDep, 
    request: UpdateExercisePerformanceRequest, 
    current_user: CurrentUser
) -> Any:
    """
    Update exercise performance for the current user on a specific date.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get user document
    users_ref = session.collection("users")
    user_doc_ref = users_ref.document(str(current_user.id))
    user_doc = user_doc_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc.to_dict()
    current_exercises = user_data.get("exercises", [])
    
    # Find the exercise in user's exercises array
    exercise_found = False
    updated_exercises = []
    
    for exercise in current_exercises:
        if isinstance(exercise, dict) and exercise.get("id") == request.exercise_id:
            exercise_found = True
            # Update the performance for the specific date
            performance = exercise.get("performance", {})
            performance[request.date] = request.performance
            exercise["performance"] = performance
            updated_exercises.append(exercise)
        else:
            updated_exercises.append(exercise)
    
    if not exercise_found:
        # Exercise not found in user's exercises, add it
        new_exercise = {
            "id": request.exercise_id,
            "performance": {request.date: request.performance}
        }
        updated_exercises.append(new_exercise)
    
    # Update user document with new exercises data
    user_doc_ref.update({"exercises": updated_exercises})
    
    return Message(message=f"Exercise performance updated successfully for {request.date}")
