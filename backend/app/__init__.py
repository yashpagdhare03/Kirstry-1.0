"""
Flask Application Factory for Kirstry backend.
"""

from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.utils import register_error_handlers
from app.routes import (
    health_bp,
    product_bp,
    inventory_bp,
    billing_bp,
    khata_bp,
    supplier_bp,
    dashboard_bp,
    analytics_bp,
    alert_bp,
)


def create_app(config_class=Config) -> Flask:
    """
    Creates and configures the Flask application instance.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configure CORS to allow Vite dev server
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
        supports_credentials=True,
    )

    # Register global error handlers
    register_error_handlers(app)

    # Register route blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(billing_bp)
    app.register_blueprint(khata_bp)
    app.register_blueprint(supplier_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(alert_bp)

    return app
