"""
Pydantic schemas for inventory stock operations and adjustments.
"""

from pydantic import BaseModel, Field
from typing import Optional


class StockInSchema(BaseModel):
    """Stock-in request validation schema."""
    product_id: str = Field(..., min_length=1, description="Product UUID")
    quantity: int = Field(..., gt=0, description="Quantity to add (>0)")
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None  # Format: YYYY-MM-DD
    purchase_date: Optional[str] = None  # Format: YYYY-MM-DD
    supplier_id: Optional[str] = None
    cost_price: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class StockOutSchema(BaseModel):
    """Stock-out request validation schema."""
    product_id: str = Field(..., min_length=1, description="Product UUID")
    quantity: int = Field(..., gt=0, description="Quantity to remove (>0)")
    reason: str = Field(..., description="Reason for stock-out: sale, damage, return, purchase")
    reference_id: Optional[str] = None
    notes: Optional[str] = None


class AdjustmentSchema(BaseModel):
    """Stock adjustment / physical count reconciliation schema."""
    product_id: str = Field(..., min_length=1, description="Product UUID")
    batch_id: str = Field(..., min_length=1, description="Batch UUID to reconcile")
    new_quantity: int = Field(..., ge=0, description="New physical count (>=0)")
    notes: Optional[str] = None
