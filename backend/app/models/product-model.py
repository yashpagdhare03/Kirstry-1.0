"""
Product and Category database model definitions.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Category:
    """Category table model."""
    id: str
    store_id: str
    name: str


@dataclass
class Product:
    """Product table model."""
    id: str
    store_id: str
    name: str
    unit: str
    category_id: Optional[str] = None
    brand: Optional[str] = None
    barcode: Optional[str] = None
    mrp: Optional[float] = None
    selling_price: Optional[float] = None
    purchase_price: Optional[float] = None
    image_url: Optional[str] = None
    low_stock_threshold: int = 10
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
