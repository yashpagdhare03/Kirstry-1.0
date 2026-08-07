"""
Routes package initialization.
Exports route blueprints.
"""

import importlib

health_routes_module = importlib.import_module("app.routes.health-routes")
health_bp = health_routes_module.health_bp

product_routes_module = importlib.import_module("app.routes.product-routes")
product_bp = product_routes_module.product_bp

inventory_routes_module = importlib.import_module("app.routes.inventory-routes")
inventory_bp = inventory_routes_module.inventory_bp

billing_routes_module = importlib.import_module("app.routes.billing-routes")
billing_bp = billing_routes_module.billing_bp

khata_routes_module = importlib.import_module("app.routes.khata-routes")
khata_bp = khata_routes_module.khata_bp

supplier_routes_module = importlib.import_module("app.routes.supplier-routes")
supplier_bp = supplier_routes_module.supplier_bp

dashboard_routes_module = importlib.import_module("app.routes.dashboard-routes")
dashboard_bp = dashboard_routes_module.dashboard_bp

analytics_routes_module = importlib.import_module("app.routes.analytics-routes")
analytics_bp = analytics_routes_module.analytics_bp

alert_routes_module = importlib.import_module("app.routes.alert-routes")
alert_bp = alert_routes_module.alert_bp

store_routes_module = importlib.import_module("app.routes.store-routes")
store_bp = store_routes_module.store_bp

__all__ = [
    "health_bp",
    "product_bp",
    "inventory_bp",
    "billing_bp",
    "khata_bp",
    "supplier_bp",
    "dashboard_bp",
    "analytics_bp",
    "alert_bp",
    "store_bp",
]
