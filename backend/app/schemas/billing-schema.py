"""
Pydantic schemas for Billing and Invoice request validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class BillItemSchema(BaseModel):
    """Line item in a POS bill."""
    product_id: str = Field(..., min_length=1, description="Product UUID")
    quantity: int = Field(..., gt=0, description="Quantity to purchase (>0)")
    unit_price: float = Field(..., ge=0, description="Unit selling price (>=0)")


class CreateBillSchema(BaseModel):
    """POS Bill Creation schema."""
    items: List[BillItemSchema] = Field(..., min_length=1, description="Array of bill items (at least 1)")
    payment_mode: str = Field(..., description="Payment mode: cash, upi, credit")
    customer_id: Optional[str] = None
    discount: Optional[float] = Field(0.0, ge=0, description="Discount amount (>=0)")
    notes: Optional[str] = None
