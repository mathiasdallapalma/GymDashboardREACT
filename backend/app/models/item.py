import uuid
from typing import Optional
from pydantic import BaseModel
from google.cloud.firestore import DocumentReference


# Shared properties
class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None


# For creating an item
class ItemCreate(ItemBase):
    pass


# For updating an item
class ItemUpdate(ItemBase):
    title: Optional[str] = None
    description: Optional[str] = None


# Firestore database model
class Item(ItemBase):
    id: str = str(uuid.uuid4())
    owner_id: str  # Reference to User document


# Public API representation
class ItemPublic(ItemBase):
    id: str
    owner_id: str


class ItemsPublic(BaseModel):
    data: list[ItemPublic]
    count: int
