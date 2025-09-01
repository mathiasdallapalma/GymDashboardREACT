import uuid
from enum import Enum
from typing import Optional
from pydantic import BaseModel
from google.cloud.firestore import DocumentReference









class ActivityBase(BaseModel):
    title: str
    exercises: Optional[list[str]] = []  # List of Exercise document IDs
    user_id: str # Reference to User document


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(ActivityBase):
    title: Optional[str] = None
    exercises: Optional[list[str]] = None


class Activity(ActivityBase):
    id: str = str(uuid.uuid4())
    


class ActivityPublic(ActivityBase):
    id: str
    


class ActivitiesPublic(BaseModel):
    data: list[ActivityPublic]
    count: int
