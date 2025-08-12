import uuid
from typing import Any
from typing import List

from fastapi import APIRouter, HTTPException

from app.utils.auth import CurrentUser, SessionDep
from app.models.item import Item, ItemCreate, ItemPublic, ItemsPublic, ItemUpdate
from app.config import settings
from app.models.message import Message


router = APIRouter(tags=["items"])


@router.get("/", response_model=ItemsPublic)
def read_items(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve items.
    """
    print("Retrieving items")
    
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")

    # Reference to the items collection
    items_ref = session.collection("items")
    
    if current_user.is_superuser:
        # Get all items for superuser
        query = items_ref.offset(skip).limit(limit)
        items_docs = list(query.stream())
        
        # Get total count
        all_items = list(items_ref.stream())
        count = len(all_items)
    else:
        # Get items only for current user
        query = items_ref.where("owner_id", "==", str(current_user.id)).offset(skip).limit(limit)
        items_docs = list(query.stream())
        
        # Get count for current user
        user_items = list(items_ref.where("owner_id", "==", str(current_user.id)).stream())
        count = len(user_items)
    
    # Convert Firestore documents to Item objects
    items = []
    for doc in items_docs:
        item_data = doc.to_dict()
        item_data["id"] = doc.id
        items.append(ItemPublic(**item_data))

    return ItemsPublic(data=items, count=count)


@router.get("/{id}", response_model=ItemPublic)
def read_item(session: SessionDep, current_user: CurrentUser, id: str) -> Any:
    """
    Get item by ID.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get item document by ID
    items_ref = session.collection("items")
    doc = items_ref.document(id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item_data = doc.to_dict()
    item_data["id"] = doc.id
    item = Item(**item_data)
    
    if not current_user.is_superuser and (item.owner_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    return item


@router.post("/", response_model=ItemPublic)
def create_item(
    *, session: SessionDep, current_user: CurrentUser, item_in: ItemCreate
) -> Any:
    """
    Create new item.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Create item data with owner_id
    item_data = item_in.model_dump()
    item_data["owner_id"] = str(current_user.id)
    
    # Add to Firestore
    items_ref = session.collection("items")
    doc_ref = items_ref.add(item_data)[1]  # add() returns (timestamp, doc_ref)
    
    # Get the created document
    created_doc = doc_ref.get()
    created_data = created_doc.to_dict()
    created_data["id"] = created_doc.id
    
    return Item(**created_data)


@router.put("/{id}", response_model=ItemPublic)
def update_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
    item_in: ItemUpdate,
) -> Any:
    """
    Update an item.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get existing item
    items_ref = session.collection("items")
    doc_ref = items_ref.document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item_data = doc.to_dict()
    item_data["id"] = doc.id
    item = Item(**item_data)
    
    if not current_user.is_superuser and (item.owner_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Update the document
    update_dict = item_in.model_dump(exclude_unset=True)
    doc_ref.update(update_dict)
    
    # Get updated document
    updated_doc = doc_ref.get()
    updated_data = updated_doc.to_dict()
    updated_data["id"] = updated_doc.id
    
    return Item(**updated_data)


@router.delete("/{id}")
def delete_item(
    session: SessionDep, current_user: CurrentUser, id: str
) -> Message:
    """
    Delete an item.
    """
    if not session:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Get existing item
    items_ref = session.collection("items")
    doc_ref = items_ref.document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item_data = doc.to_dict()
    item = Item(**item_data)
    
    if not current_user.is_superuser and (item.owner_id != str(current_user.id)):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Delete the document
    doc_ref.delete()
    
    return Message(message="Item deleted successfully")