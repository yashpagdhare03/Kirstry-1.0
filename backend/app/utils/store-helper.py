"""
Store ID extraction helper for request handlers.
Extracts X-Store-ID header (or g.store_id context if set by auth).
"""

from flask import request, g
from typing import Optional


def get_request_store_id() -> Optional[str]:
    """
    Retrieves store_id from Flask g object (if auth middleware set it)
    or from 'X-Store-ID' request header.
    """
    if hasattr(g, "store_id") and g.store_id:
        return g.store_id

    header_store_id = request.headers.get("X-Store-ID")
    if header_store_id:
        return header_store_id.strip()

    return None
