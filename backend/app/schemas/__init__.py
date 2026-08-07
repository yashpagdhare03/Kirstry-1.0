"""
Schemas package initialization.
Exports all request validation schemas.
"""

import importlib

product_schema = importlib.import_module("app.schemas.product-schema")
CreateCategorySchema = product_schema.CreateCategorySchema
CreateProductSchema = product_schema.CreateProductSchema
UpdateProductSchema = product_schema.UpdateProductSchema
BarcodeLookupSchema = product_schema.BarcodeLookupSchema

inventory_schema = importlib.import_module("app.schemas.inventory-schema")
StockInSchema = inventory_schema.StockInSchema
StockOutSchema = inventory_schema.StockOutSchema
AdjustmentSchema = inventory_schema.AdjustmentSchema

billing_schema = importlib.import_module("app.schemas.billing-schema")
BillItemSchema = billing_schema.BillItemSchema
CreateBillSchema = billing_schema.CreateBillSchema

khata_schema = importlib.import_module("app.schemas.khata-schema")
CreateCustomerSchema = khata_schema.CreateCustomerSchema
UpdateCustomerSchema = khata_schema.UpdateCustomerSchema
CreditEntrySchema = khata_schema.CreditEntrySchema
PaymentEntrySchema = khata_schema.PaymentEntrySchema

supplier_schema = importlib.import_module("app.schemas.supplier-schema")
CreateSupplierSchema = supplier_schema.CreateSupplierSchema
UpdateSupplierSchema = supplier_schema.UpdateSupplierSchema
POItemSchema = supplier_schema.POItemSchema
CreatePOSchema = supplier_schema.CreatePOSchema
UpdatePOSchema = supplier_schema.UpdatePOSchema

alert_schema = importlib.import_module("app.schemas.alert-schema")
AlertQuerySchema = alert_schema.AlertQuerySchema

store_schema = importlib.import_module("app.schemas.store-schema")
UpdateStoreSchema = store_schema.UpdateStoreSchema
InviteStoreMemberSchema = store_schema.InviteStoreMemberSchema

__all__ = [
    "CreateCategorySchema",
    "CreateProductSchema",
    "UpdateProductSchema",
    "BarcodeLookupSchema",
    "StockInSchema",
    "StockOutSchema",
    "AdjustmentSchema",
    "BillItemSchema",
    "CreateBillSchema",
    "CreateCustomerSchema",
    "UpdateCustomerSchema",
    "CreditEntrySchema",
    "PaymentEntrySchema",
    "CreateSupplierSchema",
    "UpdateSupplierSchema",
    "POItemSchema",
    "CreatePOSchema",
    "UpdatePOSchema",
    "AlertQuerySchema",
    "UpdateStoreSchema",
    "InviteStoreMemberSchema",
]
