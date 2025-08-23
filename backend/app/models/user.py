import uuid
from enum import Enum
from typing import List, Optional
from datetime import date
from pydantic import BaseModel, EmailStr


# Define possible roles
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    TRAINER = "trainer"


# Define possible sex options
class Sex(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    weight: Optional[float] = None  # in kg
    height: Optional[float] = None  # in meters
    notes: Optional[str] = None
    sex: Optional[Sex] = None
    role: UserRole = UserRole.USER


# For creating a user
class UserCreate(UserBase):
    password: str


# For registration
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER


# For updating user details
class UserUpdate(UserBase):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    notes: Optional[str] = None
    sex: Optional[Sex] = None
    role: Optional[UserRole] = None


# For updating own account
class UserUpdateMe(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    notes: Optional[str] = None
    sex: Optional[Sex] = None


# For password changes
class UpdatePassword(BaseModel):
    current_password: str
    new_password: str


# Firestore database model
class User(UserBase):
    id: str = str(uuid.uuid4())
    hashed_password: str


# Public API representation
class UserPublic(UserBase):
    id: str


class UsersPublic(BaseModel):
    data: list[UserPublic]
    count: int
