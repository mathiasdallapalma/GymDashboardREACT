import uuid
from typing import Any

from sqlmodel import Session, select

from app.security import get_password_hash, verify_password
from app.models.exercise import Exercise, ExerciseCreate 


def create_exercise(*, session: Session, exercise_in: ExerciseCreate, owner_id: uuid.UUID) -> Exercise:
    db_exercise = Exercise.model_validate(exercise_in, update={"owner_id": owner_id})
    session.add(db_exercise)
    session.commit()
    session.refresh(db_exercise)
    return db_exercise