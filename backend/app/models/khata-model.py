"""
Customer and Credit Transaction database model definitions.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime, date


@dataclass
class Customer:
    """Customer table model."""
    id: str
    store_id: str
    name: str
    phone: Optional[str] = None
    created_at: Optional[datetime] = None


@dataclass
class CreditTransaction:
    """Credit Transaction table model."""
    id: str
    store_id: str
    customer_id: str
    type: str  # 'credit', 'payment'
    amount: float
    due_date: Optional[date] = None
    note: Optional[str] = None
    sale_id: Optional[str] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
