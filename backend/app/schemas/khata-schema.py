"""
Pydantic schemas for Digital Khata (Customer Credit) management.
"""

from pydantic import BaseModel, Field
from typing import Optional


class CreateCustomerSchema(BaseModel):
    """Customer creation schema."""
    name: str = Field(..., min_length=1, max_length=255, description="Customer name")
    phone: Optional[str] = Field(None, max_length=20, description="Contact phone number")
    address: Optional[str] = Field(None, description="Customer address")
    credit_limit: Optional[float] = Field(None, ge=0, description="Max credit limit allowed")


class UpdateCustomerSchema(BaseModel):
    """Customer update schema."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    credit_limit: Optional[float] = Field(None, ge=0)
    is_active: Optional[bool] = None


class CreditEntrySchema(BaseModel):
    """Record new credit (udhari) entry for a customer."""
    customer_id: str = Field(..., min_length=1, description="Customer UUID")
    amount: float = Field(..., gt=0, description="Credit amount (>0)")
    due_date: Optional[str] = None  # Format: YYYY-MM-DD
    sale_id: Optional[str] = None
    note: Optional[str] = None


class PaymentEntrySchema(BaseModel):
    """Record payment collected from customer."""
    customer_id: str = Field(..., min_length=1, description="Customer UUID")
    amount: float = Field(..., gt=0, description="Payment amount collected (>0)")
    note: Optional[str] = None
