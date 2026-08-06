"""
Models package initialization.
Exports all database entity dataclasses.
"""

import importlib

user_model = importlib.import_module("app.models.user-model")
User = user_model.User
Store = user_model.Store
StoreMember = user_model.StoreMember

product_model = importlib.import_module("app.models.product-model")
Category = product_model.Category
Product = product_model.Product

inventory_model = importlib.import_module("app.models.inventory-model")
StockBatch = inventory_model.StockBatch
StockTransaction = inventory_model.StockTransaction

billing_model = importlib.import_module("app.models.billing-model")
Sale = billing_model.Sale
SaleItem = billing_model.SaleItem

khata_model = importlib.import_module("app.models.khata-model")
Customer = khata_model.Customer
CreditTransaction = khata_model.CreditTransaction

supplier_model = importlib.import_module("app.models.supplier-model")
Supplier = supplier_model.Supplier
PurchaseOrder = supplier_model.PurchaseOrder

alert_model = importlib.import_module("app.models.alert-model")
Alert = alert_model.Alert

__all__ = [
    "User",
    "Store",
    "StoreMember",
    "Category",
    "Product",
    "StockBatch",
    "StockTransaction",
    "Sale",
    "SaleItem",
    "Customer",
    "CreditTransaction",
    "Supplier",
    "PurchaseOrder",
    "Alert",
]
