import uuid
from typing import Any
from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.utils.auth import CurrentUser, SessionDep
from app.models.activity import (
    Activity,
    ActivityCreate,
    ActivityPublic,
    ActivitiesPublic,
    ActivityUpdate,
)
from app.config import settings
from app.models.message import Message


router = APIRouter(tags=["activities"])

@router.get("/", response_model=ActivitiesPublic)
def read_activities(
    session: SessionDep, current_user: CurrentUser, user_id: str = None, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve activities.
    If user_id is provided as a query param, filter activities for that user.
    Otherwise, get activities based on current user permissions.
    """
    print(f"Retrieving activities for user_id: {user_id}")
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    activities_ref = session.collection("activities")
    if user_id:
        # Permission: superuser, trainer, or the user themselves
        if not (
            current_user.is_superuser
            or getattr(current_user, "role", None) == "trainer"
            or user_id == str(current_user.id)
        ):
            raise HTTPException(status_code=403, detail="Not enough privileges")
        query = activities_ref.where("user_id", "==", user_id).offset(skip).limit(limit)
        activities_docs = list(query.stream())
        user_activities = list(activities_ref.where("user_id", "==", user_id).stream())
        count = len(user_activities)
    elif current_user.is_superuser:
        query = activities_ref.offset(skip).limit(limit)
        activities_docs = list(query.stream())
        all_activities = list(activities_ref.stream())
        count = len(all_activities)
    else:
        query = activities_ref.where("user_id", "==", str(current_user.id)).offset(skip).limit(limit)
        activities_docs = list(query.stream())
        user_activities = list(activities_ref.where("user_id", "==", str(current_user.id)).stream())
        count = len(user_activities)
    activities = []
    for doc in activities_docs:
        activity_data = doc.to_dict()
        activity_data["id"] = doc.id
        activities.append(ActivityPublic(**activity_data))
    return ActivitiesPublic(data=activities, count=count)


@router.get("/{id}", response_model=ActivityPublic)
def read_activity(session: SessionDep, current_user: CurrentUser, id: str) -> Any:
    """
    Get activity by ID.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get activity document by ID
    activities_ref = session.collection("activities")
    doc = activities_ref.document(id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity_data = doc.to_dict()
    activity_data["id"] = doc.id
    activity = Activity(**activity_data)
    
    if not current_user.is_superuser and (activity.user_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    return activity


@router.post("/", response_model=ActivityPublic)
def create_activity(
    *, db_client: SessionDep, current_user: CurrentUser, activity_in: ActivityCreate
) -> Any:
    """
    Create new activity.
    """
    print(f"Creating activity with data: {activity_in}")
    
    if not db_client:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Allow only superuser or trainer
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "trainer"):
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    # Create activity data with user_id
    activity_data = activity_in.model_dump()  
    # Ensure exercises is a list of strings (exercise document IDs)
    if "exercises" in activity_data and activity_data["exercises"] is not None:
        activity_data["exercises"] = [str(eid) for eid in activity_data["exercises"]]
    else:
        activity_data["exercises"] = []
   
    # Add to Firestore
    activities_ref = db_client.collection("activities")
    doc_ref = activities_ref.add(activity_data)[1]  # add() returns (timestamp, doc_ref)
    
    # Get the created document
    created_doc = doc_ref.get()
    created_data = created_doc.to_dict()
    created_data["id"] = created_doc.id
    
    # Update user's exercises field
    _update_user_exercises_on_activity_create(db_client,  activity_data["user_id"], activity_data["exercises"])
    
    return Activity(**created_data)


def _update_user_exercises_on_activity_create(session, user_id: str, exercise_ids: list[str]) -> None:
    """
    Add exercises to user's exercises field when an activity is created.
    Using the new performance map structure.
    """
    if not exercise_ids:
        return
    
    users_ref = session.collection("users")
    user_doc_ref = users_ref.document(str(user_id))
    user_doc = user_doc_ref.get()
    
    if not user_doc.exists:
        return
    
    user_data = user_doc.to_dict()
    current_exercises = user_data.get("exercises", [])
    
    # Convert current exercises to a dict for easier lookup
    exercises_dict = {ex.get("id"): ex for ex in current_exercises if isinstance(ex, dict)}
    
    # Add new exercises that don't exist yet
    updated = False
    for exercise_id in exercise_ids:
        if exercise_id not in exercises_dict:
            # Add new exercise with empty performance map
            exercises_dict[exercise_id] = {
                "id": exercise_id,
                "performance": {}
            }
            updated = True
    
    if updated:
        # Convert back to list and update user document
        new_exercises = list(exercises_dict.values())
        user_doc_ref.update({"exercises": new_exercises})


@router.put("/{id}", response_model=ActivityPublic)
def update_activity(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
    activity_in: ActivityUpdate,
) -> Any:
    """
    Update an activity.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Allow only superuser or trainer
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "trainer"):
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    # Get existing activity
    activities_ref = session.collection("activities")
    doc_ref = activities_ref.document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity_data = doc.to_dict()
    activity_data["id"] = doc.id
    activity = Activity(**activity_data)
    
    if not current_user.is_superuser and (activity.user_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Update the document
    update_dict = activity_in.model_dump(exclude_unset=True)
    # Ensure exercises is a list of strings (exercise document IDs)
    if "exercises" in update_dict and update_dict["exercises"] is not None:
        update_dict["exercises"] = [str(eid) for eid in update_dict["exercises"]]
    doc_ref.update(update_dict)
    
    # Get updated document
    updated_doc = doc_ref.get()
    updated_data = updated_doc.to_dict()
    updated_data["id"] = updated_doc.id
    
    return Activity(**updated_data)


@router.delete("/{id}")
def delete_activity(
    session: SessionDep, current_user: CurrentUser, id: str
) -> Message:
    """
    Delete an activity.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Allow only superuser or trainer
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "trainer"):
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    # Get existing activity
    activities_ref = session.collection("activities")
    doc_ref = activities_ref.document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity_data = doc.to_dict()
    activity = Activity(**activity_data)
    
    if not current_user.is_superuser and (activity.user_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Update user's exercises field before deleting activity
    exercise_ids = activity_data.get("exercises", [])
    _update_user_exercises_on_activity_delete(session, activity.user_id, exercise_ids)
    
    # Delete the document
    doc_ref.delete()
    
    return Message(message="Activity deleted successfully")


def _update_user_exercises_on_activity_delete(session, user_id: str, exercise_ids: list[str]) -> None:
    """
    Remove exercises from user's exercises field when an activity is deleted,
    but only if the exercises have no performance data stored.
    """
    if not exercise_ids:
        return
    
    users_ref = session.collection("users")
    user_doc_ref = users_ref.document(str(user_id))
    user_doc = user_doc_ref.get()
    
    if not user_doc.exists:
        return
    
    user_data = user_doc.to_dict()
    current_exercises = user_data.get("exercises", [])
    
    # Create a list to store exercises that should remain
    remaining_exercises = []
    
    for exercise in current_exercises:
        if isinstance(exercise, dict):
            exercise_id = exercise.get("id")
            performance = exercise.get("performance", {})
            
            # If this exercise is in the deleted activity
            if exercise_id in exercise_ids:
                # Only remove if there's no performance data
                if performance and len(performance) > 0:
                    # Keep the exercise because it has performance data
                    remaining_exercises.append(exercise)
                # If no performance data, don't add it (effectively removing it)
            else:
                # Keep exercises that are not in the deleted activity
                remaining_exercises.append(exercise)
    
    # Update user document with remaining exercises
    user_doc_ref.update({"exercises": remaining_exercises})


@router.post("/{id}/exercises/{exercise_id}")
def add_exercise_to_activity(
    session: SessionDep, current_user: CurrentUser, id: str, exercise_id: str
) -> ActivityPublic:
    """
    Add an exercise to an activity.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Allow only superuser or trainer
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "trainer"):
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    # Get existing activity
    activities_ref = session.collection("activities")
    doc_ref = activities_ref.document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity_data = doc.to_dict()
    activity_data["id"] = doc.id
    activity = Activity(**activity_data)
    # Allow only superuser or trainer
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "trainer"):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Verify exercise exists
    exercises_ref = session.collection("exercises")
    exercise_doc = exercises_ref.document(exercise_id).get()
    if not exercise_doc.exists:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    # Add exercise to activity if not already present
    current_exercises = activity_data.get("exercises", [])
    if exercise_id not in current_exercises:
        current_exercises.append(exercise_id)
        doc_ref.update({"exercises": current_exercises})
        
        # Add exercise to user's exercises field
        _update_user_exercises_on_activity_create(session, activity.user_id, [exercise_id])
    
    # Get updated document
    updated_doc = doc_ref.get()
    updated_data = updated_doc.to_dict()
    updated_data["id"] = updated_doc.id
    
    return Activity(**updated_data)


@router.delete("/{id}/exercises/{exercise_id}")
def remove_exercise_from_activity(
    session: SessionDep, current_user: CurrentUser, id: str, exercise_id: str
) -> ActivityPublic:
    """
    Remove an exercise from an activity.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Allow only superuser or trainer
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "trainer"):
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    # Get existing activity
    activities_ref = session.collection("activities")
    doc_ref = activities_ref.document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity_data = doc.to_dict()
    activity_data["id"] = doc.id
    activity = Activity(**activity_data)
    
    if not current_user.is_superuser and (activity.user_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Remove exercise from activity
    current_exercises = activity_data.get("exercises", [])
    if exercise_id in current_exercises:
        current_exercises.remove(exercise_id)
        doc_ref.update({"exercises": current_exercises})
        
        # Remove exercise from user's exercises field (only if no performance data)
        _update_user_exercises_on_activity_delete(session, activity.user_id, [exercise_id])
    
    # Get updated document
    updated_doc = doc_ref.get()
    updated_data = updated_doc.to_dict()
    updated_data["id"] = updated_doc.id
    
    return Activity(**updated_data)


@router.post("/assign/{activity_id}")
def assign_activity_to_user(
    session: SessionDep, current_user: CurrentUser, activity_id: str, date: str
) -> Message:
    """
    Assign an activity to the user's activities array with a specific date.
    Also updates user's exercises performance map.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Verify activity exists
    activities_ref = session.collection("activities")
    activity_doc = activities_ref.document(activity_id).get()
    if not activity_doc.exists:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity_data = activity_doc.to_dict()
    activity = Activity(**activity_data)
    
    # Check permissions
    if not current_user.is_superuser and (activity.user_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Get user document
    users_ref = session.collection("users")
    user_doc_ref = users_ref.document(str(current_user.id))
    user_doc = user_doc_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc.to_dict()
    current_activities = user_data.get("activities", [])
    current_exercises = user_data.get("exercises", [])
    
    # Check if activity is already assigned for this date
    for existing_activity in current_activities:
        if (isinstance(existing_activity, dict) and 
            existing_activity.get("id") == activity_id and 
            existing_activity.get("date") == date):
            raise HTTPException(status_code=400, detail="Activity already assigned for this date")
    
    # Add new activity assignment
    new_activity_assignment = {
        "id": activity_id,
        "date": date
    }
    current_activities.append(new_activity_assignment)
    
    # Update user's exercises with performance tracking
    activity_exercise_ids = activity_data.get("exercises", [])
    updated_exercises = _update_user_exercises_with_performance(current_exercises, activity_exercise_ids, date)
    
    # Update user document with both activities and exercises
    user_doc_ref.update({
        "activities": current_activities,
        "exercises": updated_exercises
    })
    
    return Message(message=f"Activity assigned to {date} successfully")


def _update_user_exercises_with_performance(current_exercises: list, exercise_ids: list[str], date: str) -> list:
    """
    Update user's exercises array with performance tracking.
    - If exercise doesn't exist, add it with performance[date] = 0
    - If exercise exists, add new date entry with same value as last performance or 0 if no previous performance
    """
    # Convert current exercises to a dict for easier manipulation
    exercises_dict = {}
    for exercise in current_exercises:
        if isinstance(exercise, dict) and "id" in exercise:
            exercises_dict[exercise["id"]] = exercise
    
    # Process each exercise in the activity
    for exercise_id in exercise_ids:
        if exercise_id in exercises_dict:
            # Exercise already exists - add new date entry
            existing_exercise = exercises_dict[exercise_id]
            performance = existing_exercise.get("performance", {})
            
            if performance:
                # Sort date keys as actual dates
                date_keys = sorted(performance.keys(), key=lambda d: (d and len(d) > 0) and (datetime.strptime(d, "%a %b %d %Y")) or datetime.min)
                last_date = date_keys[-1] if date_keys else None
                last_performance = performance[last_date] if last_date else 0.0
                performance[date] = last_performance
            else:
                # No previous performance, start with 0
                performance[date] = 0.0
            
            exercises_dict[exercise_id]["performance"] = performance
        else:
            # New exercise - add with initial performance
            exercises_dict[exercise_id] = {
                "id": exercise_id,
                "performance": {date: 0.0}
            }
    
    # Convert back to list
    return list(exercises_dict.values())


@router.delete("/unassign/{activity_id}")
def unassign_activity_from_user(
    session: SessionDep, current_user: CurrentUser, activity_id: str, date: str
) -> Message:
    """
    Remove an activity assignment from the user's activities array for a specific date.
    Also removes performance data for that date from all exercises in the activity.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get activity data to know which exercises are involved
    activities_ref = session.collection("activities")
    activity_doc = activities_ref.document(activity_id).get()
    if not activity_doc.exists:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity_data = activity_doc.to_dict()
    activity_exercise_ids = activity_data.get("exercises", [])
    
    # Get user document
    users_ref = session.collection("users")
    user_doc_ref = users_ref.document(str(current_user.id))
    user_doc = user_doc_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc.to_dict()
    current_activities = user_data.get("activities", [])
    current_exercises = user_data.get("exercises", [])
    
    # Find and remove the specific activity assignment
    updated_activities = []
    found = False
    
    for activity in current_activities:
        if (isinstance(activity, dict) and 
            activity.get("id") == activity_id and 
            activity.get("date") == date):
            found = True
            # Skip this activity (effectively removing it)
            continue
        else:
            updated_activities.append(activity)
    
    if not found:
        raise HTTPException(status_code=404, detail="Activity assignment not found for this date")
    
    # Remove performance data for the specified date from all exercises in the activity
    updated_exercises = _remove_performance_for_date(current_exercises, activity_exercise_ids, date)
    
    # Update user document with both updated activities and exercises
    user_doc_ref.update({
        "activities": updated_activities,
        "exercises": updated_exercises
    })
    
    return Message(message=f"Activity unassigned from {date} successfully")


def _remove_performance_for_date(current_exercises: list, exercise_ids: list[str], date: str) -> list:
    """
    Remove performance data for a specific date from exercises.
    If an exercise has no performance data left, remove the exercise entirely.
    """
    updated_exercises = []
    
    for exercise in current_exercises:
        if isinstance(exercise, dict) and "id" in exercise:
            exercise_id = exercise["id"]
            
            if exercise_id in exercise_ids:
                # This exercise is in the unassigned activity
                performance = exercise.get("performance", {})
                
                # Remove the specific date from performance
                if date in performance:
                    del performance[date]
                
                # Only keep the exercise if it still has performance data
                if performance:
                    exercise["performance"] = performance
                    updated_exercises.append(exercise)
                # If no performance data left, don't add it (effectively removing it)
            else:
                # Exercise not in the unassigned activity, keep it as is
                updated_exercises.append(exercise)
    
    return updated_exercises


@router.put("/assign/{activity_id}")
def update_activity_assignment(
    session: SessionDep, current_user: CurrentUser, activity_id: str, old_date: str, new_date: str
) -> Message:
    """
    Update an activity assignment date in the user's activities array.
    Also moves performance data from old_date to new_date for all exercises in the activity.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get activity data to know which exercises are involved
    activities_ref = session.collection("activities")
    activity_doc = activities_ref.document(activity_id).get()
    if not activity_doc.exists:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity_data = activity_doc.to_dict()
    activity_exercise_ids = activity_data.get("exercises", [])
    
    # Get user document
    users_ref = session.collection("users")
    user_doc_ref = users_ref.document(str(current_user.id))
    user_doc = user_doc_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc.to_dict()
    current_activities = user_data.get("activities", [])
    current_exercises = user_data.get("exercises", [])
    
    # Check if new date already has this activity assigned
    for activity in current_activities:
        if (isinstance(activity, dict) and 
            activity.get("id") == activity_id and 
            activity.get("date") == new_date):
            raise HTTPException(status_code=400, detail="Activity already assigned for the new date")
    
    # Find and update the specific activity assignment
    updated_activities = []
    found = False
    
    for activity in current_activities:
        if (isinstance(activity, dict) and 
            activity.get("id") == activity_id and 
            activity.get("date") == old_date):
            found = True
            # Update the date
            updated_activity = activity.copy()
            updated_activity["date"] = new_date
            updated_activities.append(updated_activity)
        else:
            updated_activities.append(activity)
    
    if not found:
        raise HTTPException(status_code=404, detail="Activity assignment not found for the old date")
    
    # Move performance data from old_date to new_date for exercises in this activity
    updated_exercises = _move_performance_date(current_exercises, activity_exercise_ids, old_date, new_date)
    
    # Update user document with both updated activities and exercises
    user_doc_ref.update({
        "activities": updated_activities,
        "exercises": updated_exercises
    })
    
    return Message(message=f"Activity assignment updated from {old_date} to {new_date} successfully")


def _move_performance_date(current_exercises: list, exercise_ids: list[str], old_date: str, new_date: str) -> list:
    """
    Move performance data from old_date to new_date for exercises in the activity.
    The performance value at new_date will be reset based on existing performance:
    - If there's other performance data, use the last performance value
    - If no other performance data exists, use 0
    """
    updated_exercises = []
    
    for exercise in current_exercises:
        if isinstance(exercise, dict) and "id" in exercise:
            exercise_id = exercise["id"]
            
            if exercise_id in exercise_ids:
                # This exercise is in the activity being moved
                performance = exercise.get("performance", {})
                
                # Remove the old date first
                if old_date in performance:
                    del performance[old_date]
                
                # Determine the reset value based on remaining performance data
                if performance:
                    # Get the last performance value from remaining data
                    reset_value = list(performance.values())[-1]
                else:
                    # No other performance data, start with 0
                    reset_value = 0.0
                
                # Add to new date with reset value
                performance[new_date] = reset_value
                exercise["performance"] = performance
                
                updated_exercises.append(exercise)
            else:
                # Exercise not in the moved activity, keep it as is
                updated_exercises.append(exercise)
        else:
            # Keep non-dict entries as is
            updated_exercises.append(exercise)
    
    return updated_exercises


@router.get("/exercises/{user_id}/{date}")
def get_exercises_for_day(
    session: SessionDep, current_user: CurrentUser, user_id: str, date: str
) -> Any:
    """
    Retrieve exercises for a specific user on a specific date.
    Logic: 
    1. Get the user's activities array
    2. Find activity assigned to the given date
    3. Fetch the activity details to get exercises
    4. Return the exercises list
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Check permissions - users can only access their own data unless they're superuser
    if not current_user.is_superuser and user_id != str(current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Get user document
    users_ref = session.collection("users")
    user_doc_ref = users_ref.document(user_id)
    user_doc = user_doc_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc.to_dict()
    user_activities = user_data.get("activities", [])
    
    # Find activity assigned to the given date
    assigned_activity_id = None
    for activity_assignment in user_activities:
        print(f"checking {activity_assignment.get('date')} against {date}")
        if (isinstance(activity_assignment, dict) and
            activity_assignment.get("date") == date):
            print(f"Found matching activity: {activity_assignment.get('id')}")
            assigned_activity_id = activity_assignment.get("id")
            break
    
    if not assigned_activity_id:
        return {
            "date": date,
            "activity": None,
            "exercises": [],
            "message": "No activity assigned for this date"
        }
    
    # Fetch the activity details to get exercises
    activities_ref = session.collection("activities")
    activity_doc = activities_ref.document(assigned_activity_id).get()
    
    if not activity_doc.exists:
        raise HTTPException(status_code=404, detail="Assigned activity not found")
    
    activity_data = activity_doc.to_dict()
    activity_data["id"] = activity_doc.id
    activity = Activity(**activity_data)
    
    # Get exercise IDs from the activity
    exercise_ids = activity_data.get("exercises", [])
    
    # Fetch exercise details for each exercise ID
    exercises = []
    if exercise_ids:
        exercises_ref = session.collection("exercises")
        for exercise_id in exercise_ids:
            exercise_doc = exercises_ref.document(exercise_id).get()
            if exercise_doc.exists:
                exercise_data = exercise_doc.to_dict()
                exercise_data["id"] = exercise_doc.id
                exercises.append(exercise_data)
    
    return {
        "date": date,
        "activity": {
            "id": activity.id,
            "title": activity.title,
            "user_id": activity.user_id
        },
        "exercises": exercises,
        "exercises_count": len(exercises)
    }


@router.get("/user", response_model=ActivitiesPublic)
def get_activities_for_user(
    session: SessionDep, current_user: CurrentUser, user_id: str, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all activities for a specific user (user_id as query param).
    Accessible by superuser, trainer, or the user themselves.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    # Permission check
    if not (
        current_user.is_superuser
        or getattr(current_user, "role", None) == "trainer"
        or user_id == str(current_user.id)
    ):
        raise HTTPException(status_code=403, detail="Not enough privileges")
    activities_ref = session.collection("activities")
    query = activities_ref.where("user_id", "==", user_id).offset(skip).limit(limit)
    activities_docs = list(query.stream())
    all_user_activities = list(activities_ref.where("user_id", "==", user_id).stream())
    count = len(all_user_activities)
    activities = []
    for doc in activities_docs:
        activity_data = doc.to_dict()
        activity_data["id"] = doc.id
        activities.append(ActivityPublic(**activity_data))
    return ActivitiesPublic(data=activities, count=count)