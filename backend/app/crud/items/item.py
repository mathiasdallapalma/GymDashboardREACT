import uuid
from typing import Any

from app.models.item import Item, ItemCreate


def create_item(*, session: Any, item_in: ItemCreate, owner_id: str) -> Item:
    """Create item in Firestore"""
    # Create item data with owner_id
    item_data = item_in.model_dump()
    item_data["owner_id"] = owner_id
    item_data["id"] = str(uuid.uuid4())
    
    # Add to Firestore
    items_ref = session.collection("items")
    doc_ref = items_ref.document(item_data["id"])
    doc_ref.set(item_data)
    
    # Return Item object
    return Item(**item_data)