"""
Standardized JSON response helper for API routes.
Returns consistent response shape: { "success": bool, "data": ..., "message": str }
"""

from typing import Any, Dict, Tuple
from flask import jsonify, Response


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200
) -> Tuple[Response, int]:
    """
    Generate a standardized success JSON response.
    """
    payload: Dict[str, Any] = {
        "success": True,
        "data": data if data is not None else {},
        "message": message,
    }
    return jsonify(payload), status_code


def error_response(
    message: str = "Error",
    status_code: int = 400,
    data: Any = None
) -> Tuple[Response, int]:
    """
    Generate a standardized error JSON response.
    """
    payload: Dict[str, Any] = {
        "success": False,
        "data": data if data is not None else {},
        "message": message,
    }
    return jsonify(payload), status_code
