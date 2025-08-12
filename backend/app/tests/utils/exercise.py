from sqlmodel import Session


import app.crud.exercies.exercise as crud
from app.models.exercise import Exercise, ExerciseCreate
from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_lower_string


def create_random_exercise(db: Session) -> Exercise:
    user = create_random_user(db)
    owner_id = user.id
    assert owner_id is not None
    title = random_lower_string()
    description = random_lower_string()
    exercise_in = ExerciseCreate(title=title, description=description)
    return crud.create_exercise(session=db, exercise_in=exercise_in, owner_id=owner_id)
