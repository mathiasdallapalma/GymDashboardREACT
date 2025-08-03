#!/usr/bin/env python3
"""
Script to initialize the database with tables and a superuser
"""
from sqlmodel import SQLModel, Session
from app.database import engine
from app.config import settings
from app.models.user import User
from app.models.item import Item
from app.crud.auth.user import create_user
from app.models.user import UserCreate


def init_db():
    """
    Initialize database with tables and first superuser
    """
    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    
    print("Creating first superuser...")
    with Session(engine) as session:
        # Check if superuser already exists
        from sqlmodel import select
        existing_user = session.exec(
            select(User).where(User.email == settings.FIRST_SUPERUSER)
        ).first()
        
        if not existing_user:
            user_in = UserCreate(
                email=settings.FIRST_SUPERUSER,
                password=settings.FIRST_SUPERUSER_PASSWORD,
                is_superuser=True,
                full_name="Super User"
            )
            user = create_user(session=session, user_create=user_in)
            print(f"Superuser created: {user.email}")
        else:
            print(f"Superuser already exists: {existing_user.email}")


if __name__ == "__main__":
    init_db()
    print("Database initialization complete!")