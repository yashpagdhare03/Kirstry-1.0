"""
Supplier and Purchase Order database model definitions.
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime


@dataclass
class Supplier:
    """Supplier table model."""
    id: str
    store_id: str
    name: str
    phone: Optional[str] = None
    items_supplied: Optional[str] = None
    created_at: Optional[datetime] = None


@dataclass
class PurchaseOrder:
    """Purchase Order table model."""
    id: str
    store_id: str
    supplier_id: str
    items: List[Dict[str, Any]]
    status: str = "draft"  # 'draft', 'sent', 'received'
    total_amount: Optional[float] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
