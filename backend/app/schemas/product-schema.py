"""
Pydantic schemas for Category and Product request validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class CreateCategorySchema(BaseModel):
    """Category creation schema."""
    name: str = Field(..., min_length=1, max_length=100, description="Category name")


class CreateProductSchema(BaseModel):
    """Product creation schema."""
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    unit: str = Field(..., min_length=1, max_length=50, description="Unit of measurement (e.g. kg, pack, pcs)")
    category_id: Optional[str] = None
    brand: Optional[str] = None
    barcode: Optional[str] = None
    mrp: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    purchase_price: Optional[float] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(10, ge=0)


class UpdateProductSchema(BaseModel):
    """Product update schema."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    category_id: Optional[str] = None
    brand: Optional[str] = None
    barcode: Optional[str] = None
    mrp: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    purchase_price: Optional[float] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class BarcodeLookupSchema(BaseModel):
    """Barcode lookup request schema."""
    barcode: str = Field(..., min_length=1, description="Barcode string")
