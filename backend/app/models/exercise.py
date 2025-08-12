import uuid
from enum import Enum
from typing import Optional
from pydantic import BaseModel
from google.cloud.firestore import DocumentReference


# Define possible roles
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"


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


class Equipment(str, Enum):
    NONE = "none"
    DUMBBELL = "dumbbell"
    BARBELL = "barbell"
    MACHINE = "machine"
    BAND = "band"
    MAT = "mat"
    OTHER = "other"


class Difficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


# Shared properties

class ExerciseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[ExerciseCategory] = None
    muscle_group: Optional[MuscleGroup] = None
    difficulty: Optional[Difficulty] = None
    duration: Optional[int] = None  # in seconds, non-negative assumed
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
