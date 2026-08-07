"""
Pydantic schemas for Authentication request payloads.
"""

from pydantic import BaseModel, Field
from typing import Optional


class SignUpSchema(BaseModel):
    """Sign up payload schema."""
    email: str = Field(..., min_length=3, max_length=255, description="User email address")
    password: str = Field(..., min_length=6, description="User password (min 6 chars)")
    name: Optional[str] = Field(None, max_length=255, description="User full name")


class LoginSchema(BaseModel):
    """Sign in payload schema."""
    email: str = Field(..., min_length=3, max_length=255, description="User email address")
    password: str = Field(..., min_length=1, description="User password")


class GoogleAuthSchema(BaseModel):
    """Google OAuth token exchange schema."""
    id_token: str = Field(..., min_length=1, description="Google OAuth ID token")


class StoreSetupSchema(BaseModel):
    """Store creation wizard schema for new store owners."""
    store_name: str = Field(..., min_length=1, max_length=255, description="Store business name")
    address: Optional[str] = Field(None, description="Store physical address")
    gstin: Optional[str] = Field(None, max_length=20, description="GSTIN tax number")
    phone: Optional[str] = Field(None, max_length=20, description="Store phone number")


class RefreshTokenSchema(BaseModel):
    """Token refresh payload schema."""
    refresh_token: str = Field(..., min_length=1, description="Supabase Auth refresh token")
