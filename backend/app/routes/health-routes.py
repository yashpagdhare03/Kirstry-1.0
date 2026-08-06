"""
Health check route blueprint.
Provides GET /api/health endpoint to verify backend operational status.
"""

from flask import Blueprint
from app.utils import success_response

health_bp = Blueprint("health", __name__)


@health_bp.route("/api/health", methods=["GET"])
def health_check():
    """
    Health check endpoint returning 200 OK with standardized JSON shape.
    """
    return success_response(data={}, message="OK", status_code=200)
