#!/usr/bin/env python3
"""
Script to initialize the database with tables and a superuser
"""
from app.config import settings
from app.database import init_db

if __name__ == "__main__":
    pass  # pragma: no cover


"""
Backup Firestore collections to JSON files.
Creates one JSON file per top-level collection inside ./backups/ with a timestamp.
If app.config.settings.firebase_credentials_path is set, it will use that service account file to initialize the SDK.
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore

from app.config import settings


def get_firestore_client() -> Any:
    """Initialize firebase_admin (if needed) and return a Firestore client."""
    try:
        # If already initialized this will succeed
        firebase_admin.get_app()
    except ValueError:
        # Not initialized yet
        cred_path = getattr(settings, "firebase_credentials_path", None)
        if cred_path:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Initialize with default credentials (e.g. environment GOOGLE_APPLICATION_CREDENTIALS)
            firebase_admin.initialize_app()
    return firestore.client()


def backup_collection(coll_ref: Any, out_dir: Path) -> None:
    """Dump all documents from a collection reference into a JSON file."""
    docs = list(coll_ref.stream())
    items = []
    for doc in docs:
        data = doc.to_dict() or {}
        data["id"] = doc.id
        items.append(data)

    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = out_dir / f"{coll_ref.id}_{ts}.json"
    with filename.open("w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(items)} documents to {filename}")


def main() -> None:
    out_dir = Path(__file__).resolve().parent / "backups"
    out_dir.mkdir(parents=True, exist_ok=True)

    db = get_firestore_client()

    collections = list(db.collections())
    if not collections:
        print("No top-level collections found to backup.")
        return

    for coll in collections:
        try:
            backup_collection(coll, out_dir)
        except Exception as e:
            print(f"Failed to backup collection {getattr(coll, 'id', str(coll))}: {e}")


if __name__ == "__main__":
    main()
