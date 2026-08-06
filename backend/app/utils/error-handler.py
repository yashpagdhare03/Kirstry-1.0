"""
Global error handlers for Flask application.
Catches HTTP exceptions and unhandled exceptions, returning standardized JSON responses.
"""

from flask import Flask
from werkzeug.exceptions import HTTPException
from app.utils import error_response


def register_error_handlers(app: Flask) -> None:
    """
    Registers global error handlers on the Flask app.
    """

    @app.errorhandler(HTTPException)
    def handle_http_exception(e: HTTPException):
        """Handle HTTP errors (400, 401, 403, 404, 500, etc.)."""
        message = e.description or e.name
        return error_response(message=message, status_code=e.code or 500)

    @app.errorhandler(Exception)
    def handle_generic_exception(e: Exception):
        """Handle unhandled exceptions."""
        app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return error_response(message="Internal server error", status_code=500)
