"""
Pydantic schemas for Store and Staff Member request validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class UpdateStoreSchema(BaseModel):
    """Store profile update schema."""
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="Store name")
    address: Optional[str] = Field(None, description="Store physical address")
    gstin: Optional[str] = Field(None, max_length=20, description="GSTIN tax number")
    phone: Optional[str] = Field(None, max_length=20, description="Store phone number")


class InviteStoreMemberSchema(BaseModel):
    """Staff member invitation schema."""
    email: str = Field(..., min_length=3, max_length=255, description="Staff member email address")
    name: Optional[str] = Field(None, description="Staff member name")
    role: Optional[str] = Field("staff", description="Member role: owner or staff")
