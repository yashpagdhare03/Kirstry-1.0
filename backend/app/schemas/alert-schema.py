"""
Pydantic schemas for Alerts management and request validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class AlertQuerySchema(BaseModel):
    """Schema for querying alerts with optional filters."""
    type: Optional[str] = Field(None, description="Alert type: expiry or low_stock")
    severity: Optional[str] = Field(None, description="Severity: info, warning, critical")
    is_read: Optional[bool] = Field(None, description="Read status filter")
