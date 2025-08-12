#!/usr/bin/env python3
"""
Script to initialize the database with tables and a superuser
"""
from app.config import settings
from app.database import init_db

if __name__ == "__main__":
    
    print("Initializing Firebase Firestore...")
    init_db()
    
    
    print("Database initialization complete!")