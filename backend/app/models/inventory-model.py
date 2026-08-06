"""
Stock batch and stock transaction database model definitions.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime, date


@dataclass
class StockBatch:
    """Stock Batch table model."""
    id: str
    product_id: str
    store_id: str
    quantity_remaining: int
    initial_quantity: int
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    purchase_date: Optional[date] = None
    supplier_id: Optional[str] = None
    cost_price: Optional[float] = None
    created_at: Optional[datetime] = None


@dataclass
class StockTransaction:
    """Stock Transaction table model (Append-only)."""
    id: str
    store_id: str
    product_id: str
    type: str  # 'stock_in', 'stock_out', 'adjustment'
    quantity: int
    batch_id: Optional[str] = None
    reason: Optional[str] = None  # 'purchase', 'sale', 'damage', 'return', 'reconciliation'
    reference_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
