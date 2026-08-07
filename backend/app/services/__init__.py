"""
Services package initialization.
Exports service functions for business logic layer.
"""

import importlib

barcode_service_module = importlib.import_module("app.services.barcode-service")
lookup_barcode = barcode_service_module.lookup_barcode

storage_service_module = importlib.import_module("app.services.storage-service")
upload_product_image = storage_service_module.upload_product_image

product_service_module = importlib.import_module("app.services.product-service")
create_category = product_service_module.create_category
get_categories = product_service_module.get_categories
create_product = product_service_module.create_product
get_products = product_service_module.get_products
get_product_by_id = product_service_module.get_product_by_id
update_product = product_service_module.update_product
delete_product = product_service_module.delete_product
upload_product_image_to_supabase = product_service_module.upload_product_image_to_supabase

inventory_service_module = importlib.import_module("app.services.inventory-service")
record_stock_in = inventory_service_module.record_stock_in
record_stock_out = inventory_service_module.record_stock_out
record_adjustment = inventory_service_module.record_adjustment
get_stock_levels = inventory_service_module.get_stock_levels
get_transactions = inventory_service_module.get_transactions
get_batches = inventory_service_module.get_batches

invoice_service_module = importlib.import_module("app.services.invoice-service")
generate_invoice_pdf = invoice_service_module.generate_invoice_pdf
upload_invoice_pdf = invoice_service_module.upload_invoice_pdf

billing_service_module = importlib.import_module("app.services.billing-service")
create_bill = billing_service_module.create_bill
get_sales = billing_service_module.get_sales
get_sale_by_id = billing_service_module.get_sale_by_id
get_daily_summary = billing_service_module.get_daily_summary
generate_invoice_for_sale = billing_service_module.generate_invoice_for_sale
get_whatsapp_share_link = billing_service_module.get_whatsapp_share_link

khata_service_module = importlib.import_module("app.services.khata-service")
create_customer = khata_service_module.create_customer
get_customers = khata_service_module.get_customers
get_customer_by_id = khata_service_module.get_customer_by_id
update_customer = khata_service_module.update_customer
record_credit = khata_service_module.record_credit
record_payment = khata_service_module.record_payment
get_outstanding_customers = khata_service_module.get_outstanding_customers
get_khata_summary = khata_service_module.get_khata_summary

supplier_service_module = importlib.import_module("app.services.supplier-service")
create_supplier = supplier_service_module.create_supplier
get_suppliers = supplier_service_module.get_suppliers
get_supplier_by_id = supplier_service_module.get_supplier_by_id
update_supplier = supplier_service_module.update_supplier
delete_supplier = supplier_service_module.delete_supplier
create_purchase_order = supplier_service_module.create_purchase_order
get_purchase_orders = supplier_service_module.get_purchase_orders
get_po_by_id = supplier_service_module.get_po_by_id
update_purchase_order = supplier_service_module.update_purchase_order
delete_purchase_order = supplier_service_module.delete_purchase_order
get_po_whatsapp_share_link = supplier_service_module.get_po_whatsapp_share_link

dashboard_service_module = importlib.import_module("app.services.dashboard-service")
get_dashboard_summary = dashboard_service_module.get_dashboard_summary
get_expiry_alerts = dashboard_service_module.get_expiry_alerts
get_low_stock_alerts = dashboard_service_module.get_low_stock_alerts
get_recent_sales = dashboard_service_module.get_recent_sales

analytics_service_module = importlib.import_module("app.services.analytics-service")
get_fast_moving_products = analytics_service_module.get_fast_moving_products
get_slow_moving_products = analytics_service_module.get_slow_moving_products
get_sales_trends = analytics_service_module.get_sales_trends
get_inventory_value_by_category = analytics_service_module.get_inventory_value_by_category

alert_service_module = importlib.import_module("app.services.alert-service")
generate_store_alerts = alert_service_module.generate_store_alerts
get_alerts = alert_service_module.get_alerts
mark_alert_read = alert_service_module.mark_alert_read
mark_all_alerts_read = alert_service_module.mark_all_alerts_read
get_unread_count = alert_service_module.get_unread_count

store_service_module = importlib.import_module("app.services.store-service")
get_store_details = store_service_module.get_store_details
update_store_details = store_service_module.update_store_details
get_store_members = store_service_module.get_store_members
invite_store_member = store_service_module.invite_store_member
remove_store_member = store_service_module.remove_store_member

auth_service_module = importlib.import_module("app.services.auth-service")
sign_up_user = auth_service_module.sign_up_user
sign_in_user = auth_service_module.sign_in_user
authenticate_google_user = auth_service_module.authenticate_google_user
setup_user_store = auth_service_module.setup_user_store
refresh_user_token = auth_service_module.refresh_user_token
get_user_profile = auth_service_module.get_user_profile

__all__ = [
    "lookup_barcode",
    "upload_product_image",
    "create_category",
    "get_categories",
    "create_product",
    "get_products",
    "get_product_by_id",
    "update_product",
    "delete_product",
    "upload_product_image_to_supabase",
    "record_stock_in",
    "record_stock_out",
    "record_adjustment",
    "get_stock_levels",
    "get_transactions",
    "get_batches",
    "generate_invoice_pdf",
    "upload_invoice_pdf",
    "create_bill",
    "get_sales",
    "get_sale_by_id",
    "get_daily_summary",
    "generate_invoice_for_sale",
    "get_whatsapp_share_link",
    "create_customer",
    "get_customers",
    "get_customer_by_id",
    "update_customer",
    "record_credit",
    "record_payment",
    "get_outstanding_customers",
    "get_khata_summary",
    "create_supplier",
    "get_suppliers",
    "get_supplier_by_id",
    "update_supplier",
    "delete_supplier",
    "create_purchase_order",
    "get_purchase_orders",
    "get_po_by_id",
    "update_purchase_order",
    "delete_purchase_order",
    "get_po_whatsapp_share_link",
    "get_dashboard_summary",
    "get_expiry_alerts",
    "get_low_stock_alerts",
    "get_recent_sales",
    "get_fast_moving_products",
    "get_slow_moving_products",
    "get_sales_trends",
    "get_inventory_value_by_category",
    "generate_store_alerts",
    "get_alerts",
    "mark_alert_read",
    "mark_all_alerts_read",
    "get_unread_count",
    "get_store_details",
    "update_store_details",
    "get_store_members",
    "invite_store_member",
    "remove_store_member",
    "sign_up_user",
    "sign_in_user",
    "authenticate_google_user",
    "setup_user_store",
    "refresh_user_token",
    "get_user_profile",
]
