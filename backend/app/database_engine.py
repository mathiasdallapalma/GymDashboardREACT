from google.cloud import firestore
import os
from app.config import settings

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


print("Connecting to Firebase Firestore")
# Initialize Firestore client
if settings.FIREBASE_CREDENTIALS_PATH:

    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)

    app = firebase_admin.initialize_app(cred)

    firestore_client = firestore.client()
    

