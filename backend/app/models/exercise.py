import uuid
from enum import Enum
from typing import Optional
from pydantic import BaseModel
from google.cloud.firestore import DocumentReference


class ExerciseCategory(str, Enum):
    STRENGTH = "strength"
    CARDIO = "cardio"
    FLEXIBILITY = "flexibility"
    BALANCE = "balance"
    OTHER = "other"


class MuscleGroup(str, Enum):
    CHEST = "chest"
    BACK = "back"
    LEGS = "legs"
    ARMS = "arms"
    SHOULDERS = "shoulders"
    CORE = "core"
    FULL_BODY = "full_body"
    OTHER = "other"



class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


# Shared properties

class ExerciseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[ExerciseCategory] = None
    muscle_group: Optional[MuscleGroup] = None
    reps: Optional[int] = None
    sets: Optional[int] = None
    duration: Optional[int] = None
    difficulty: Optional[Difficulty] = None
    
    image_url: Optional[str] = None
    video_url: Optional[str] = None



class ExerciseCreate(ExerciseBase):
    pass


class ExerciseUpdate(ExerciseBase):
    title: Optional[str] = None


class Exercise(ExerciseBase):
    id: str = str(uuid.uuid4())
    owner_id: str  # Reference to User document


class ExercisePublic(ExerciseBase):
    id: str
    owner_id: str


class ExercisesPublic(BaseModel):
    data: list[ExercisePublic]
    count: int
