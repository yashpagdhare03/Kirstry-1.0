"""
Sale and Sale Item database model definitions.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Sale:
    """Sale table model."""
    id: str
    store_id: str
    invoice_number: str
    total_amount: float
    payment_mode: str  # 'cash', 'upi', 'credit'
    items_count: Optional[int] = None
    subtotal: Optional[float] = None
    discount: float = 0.0
    customer_id: Optional[str] = None
    invoice_url: Optional[str] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None


@dataclass
class SaleItem:
    """Sale Item table model."""
    id: str
    sale_id: str
    product_id: str
    quantity: int
    unit_price: float
    total_price: float
    batch_id: Optional[str] = None
