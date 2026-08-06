"""
Alert database model definition.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Alert:
    """Alert table model."""
    id: str
    store_id: str
    type: str  # 'expiry', 'low_stock'
    message: str
    severity: str  # 'info', 'warning', 'critical'
    product_id: Optional[str] = None
    batch_id: Optional[str] = None
    is_read: bool = False
    created_at: Optional[datetime] = None
