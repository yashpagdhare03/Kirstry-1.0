"""
Pydantic schemas for Supplier and Purchase Order request validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class CreateSupplierSchema(BaseModel):
    """Supplier creation schema."""
    name: str = Field(..., min_length=1, max_length=255, description="Supplier name")
    phone: Optional[str] = Field(None, max_length=20, description="Contact phone number")
    items_supplied: Optional[str] = Field(None, description="Comma separated or description of items supplied")


class UpdateSupplierSchema(BaseModel):
    """Supplier update schema."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    items_supplied: Optional[str] = None


class POItemSchema(BaseModel):
    """Line item in a Purchase Order."""
    product_id: Optional[str] = None
    product_name: str = Field(..., min_length=1, description="Product name")
    quantity: int = Field(..., gt=0, description="Order quantity (>0)")
    estimated_cost: Optional[float] = Field(None, ge=0, description="Estimated unit cost price (>=0)")


class CreatePOSchema(BaseModel):
    """Purchase Order creation schema."""
    supplier_id: str = Field(..., min_length=1, description="Supplier UUID")
    items: List[POItemSchema] = Field(..., min_length=1, description="Line items array (at least 1)")
    notes: Optional[str] = None


class UpdatePOSchema(BaseModel):
    """Purchase Order update schema."""
    status: Optional[str] = Field(None, description="New status: draft, sent, received, cancelled")
    items: Optional[List[POItemSchema]] = None
    notes: Optional[str] = None
