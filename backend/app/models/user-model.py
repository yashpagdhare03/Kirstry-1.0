"""
User and Store membership database model definitions.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class User:
    """User table model."""
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None


@dataclass
class Store:
    """Store table model."""
    id: str
    owner_id: str
    name: str
    address: Optional[str] = None
    gstin: Optional[str] = None
    created_at: Optional[datetime] = None


@dataclass
class StoreMember:
    """Store Member table model."""
    id: str
    store_id: str
    user_id: str
    role: str  # 'owner' or 'staff'
    created_at: Optional[datetime] = None
