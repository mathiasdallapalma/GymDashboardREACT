import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.utils.auth import CurrentUser, SessionDep
from app.models.exercise import (
    Exercise,
    ExerciseCreate,
    ExercisePublic,
    ExercisesPublic,
    ExerciseUpdate,
)
from app.config import settings
from app.models.message import Message


router = APIRouter(tags=["exercises"])


@router.get("/", response_model=ExercisesPublic)
def read_exercises(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve active exercises only.
    """
    print("Retrieving active exercises")
    
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")

    # Reference to the exercises collection
    exercises_ref = session.collection("exercises")
    
    if current_user.is_superuser:
        # Get all active exercises for superuser
        query = exercises_ref.where("is_active", "==", True).offset(skip).limit(limit)
        exercises_docs = list(query.stream())
        
        # Get total count of active exercises
        all_active_exercises = list(exercises_ref.where("is_active", "==", True).stream())
        count = len(all_active_exercises)
    else:
        # Get active exercises only for current user
        query = exercises_ref.where("owner_id", "==", str(current_user.id)) \
                           .where("is_active", "==", True) \
                           .offset(skip).limit(limit)
        exercises_docs = list(query.stream())
        
        # Get count of active exercises for current user
        user_active_exercises = list(exercises_ref.where("owner_id", "==", str(current_user.id))
                                   .where("is_active", "==", True).stream())
        count = len(user_active_exercises)
    
    # Convert Firestore documents to Exercise objects
    exercises = []
    for doc in exercises_docs:
        exercise_data = doc.to_dict()
        exercise_data["id"] = doc.id
        exercises.append(ExercisePublic(**exercise_data))

    return ExercisesPublic(data=exercises, count=count)


@router.get("/{id}", response_model=ExercisePublic)
def read_exercise(session: SessionDep, current_user: CurrentUser, id: str) -> Any:
    """
    Get exercise by ID (only if active).
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get exercise document by ID
    exercises_ref = session.collection("exercises")
    doc = exercises_ref.document(id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    exercise_data = doc.to_dict()
    exercise_data["id"] = doc.id
    exercise = Exercise(**exercise_data)
    
    
    return exercise


@router.post("/", response_model=ExercisePublic)
def create_exercise(
    *, db_client: SessionDep, current_user: CurrentUser, exercise_in: ExerciseCreate
) -> Any:
    """
    Create new exercise.
    """
    print(f"Creating exercise with data: {exercise_in}")
    
    if not db_client:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Create exercise data with owner_id
    exercise_data = exercise_in.model_dump()
    exercise_data["owner_id"] = str(current_user.id)
    
    # Ensure is_active is set (defaults to True)
    if "is_active" not in exercise_data:
        exercise_data["is_active"] = True
    
    # Convert enums to their string values for Firestore
    if "category" in exercise_data and exercise_data["category"]:
        exercise_data["category"] = exercise_data["category"].value
    if "muscle_group" in exercise_data and exercise_data["muscle_group"]:
        exercise_data["muscle_group"] = exercise_data["muscle_group"].value
    if "difficulty" in exercise_data and exercise_data["difficulty"]:
        exercise_data["difficulty"] = exercise_data["difficulty"].value
    
    print(f"Exercise data to save: {exercise_data}")
    
    # Add to Firestore
    exercises_ref = db_client.collection("exercises")
    doc_ref = exercises_ref.add(exercise_data)[1]  # add() returns (timestamp, doc_ref)
    
    # Get the created document
    created_doc = doc_ref.get()
    created_data = created_doc.to_dict()
    created_data["id"] = created_doc.id
    
    return Exercise(**created_data)


@router.put("/{id}", response_model=ExercisePublic)
def update_exercise(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
    exercise_in: ExerciseUpdate,
) -> Any:
    """
    Update an exercise.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get existing exercise
    exercises_ref = session.collection("exercises")
    doc_ref = exercises_ref.document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    exercise_data = doc.to_dict()
    exercise_data["id"] = doc.id
    exercise = Exercise(**exercise_data)
    
    # Check if exercise is active (unless we're updating the is_active field)
    if not exercise.is_active and not exercise_in.is_active:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    if not current_user.is_superuser and (exercise.owner_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Update the document
    update_dict = exercise_in.model_dump(exclude_unset=True)
    
    # Convert enums to their string values for Firestore
    if "category" in update_dict and update_dict["category"]:
        update_dict["category"] = update_dict["category"].value
    if "muscle_group" in update_dict and update_dict["muscle_group"]:
        update_dict["muscle_group"] = update_dict["muscle_group"].value
    if "difficulty" in update_dict and update_dict["difficulty"]:
        update_dict["difficulty"] = update_dict["difficulty"].value
    
    doc_ref.update(update_dict)
    
    # Get updated document
    updated_doc = doc_ref.get()
    updated_data = updated_doc.to_dict()
    updated_data["id"] = updated_doc.id
    
    return Exercise(**updated_data)


@router.delete("/{id}")
def delete_exercise(
    session: SessionDep, current_user: CurrentUser, id: str
) -> Message:
    """
    Soft delete an exercise by setting is_active to False.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get existing exercise
    exercises_ref = session.collection("exercises")
    doc_ref = exercises_ref.document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    exercise_data = doc.to_dict()
    exercise = Exercise(**exercise_data)
    
    # Check if exercise is already inactive
    if not exercise.is_active:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    if not current_user.is_superuser and (exercise.owner_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Soft delete: set is_active to False instead of deleting the document
    doc_ref.update({"is_active": False})
    
    return Message(message="Exercise deactivated successfully")