# Kirstry 1.0 — Backend API & Frontend Integration Documentation

Welcome to the backend reference documentation for **Kirstry 1.0** — an AI-assisted smart inventory management and Point-of-Sale (POS) application tailored for Kirana (grocery) stores in India.

This document serves as the complete technical contract between the Flask backend and the React + Vite frontend application.

---

## 🛠️ Technology Stack & Architecture

- **Core Framework**: Python 3.14 + Flask (Modular Application Factory with Blueprints)
- **Database**: Supabase PostgreSQL (14 Relational Tables with Foreign Keys and Indexes)
- **Storage**: Supabase Storage Buckets (`product-images`, `invoices`)
- **PDF Generation**: ReportLab Python Library (GST-compliant Tax Invoices)
- **Validation**: Pydantic models for request payload parsing
- **Integrations**: Open Food Facts API (Barcode Lookup), WhatsApp Share URL Generator (`wa.me`)

---

## 🚀 Running the Backend Server Locally

```bash
cd backend

# 1. Activate virtual environment
source venv/bin/activate

# 2. Install dependencies (if not already installed)
pip install -r requirements.txt

# 3. Start development server (Runs on port 5001)
python run.py
```

- **Base URL**: `http://localhost:5001/api`
- **Health Check**: `GET http://localhost:5001/api/health`

---

## 🔐 Mandatory Request Headers & Store Isolation

All business logic endpoints are strictly isolated by store tenancy. **Every API call from the frontend MUST include the `X-Store-ID` header.**

| Header | Value | Description |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Required for `POST` and `PUT` request bodies |
| `X-Store-ID` | `<store_uuid>` | Store tenancy context (e.g. `00000000-0000-0000-0000-000000000001`) |
| `Authorization` | `Bearer <jwt_token>` | Supabase Auth JWT token (when auth is active) |

---

## 📦 Standard API Response Envelope

Every endpoint returns a consistent JSON envelope:

### ✅ Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource created / retrieved successfully"
}
```

### ❌ Error Response (HTTP 400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "data": {},
  "message": "Detailed error description or validation details"
}
```

---

## 🗺️ Complete API Endpoint Sitemap for Frontend

### 1. 🏥 Health Check (`app.routes.health-routes`)
- `GET /api/health` — API health status

### 2. 🛒 Product Management (`app.routes.product-routes`)
- `POST /api/categories` — Create category `{ "name": "Dairy" }`
- `GET /api/categories` — List store categories
- `POST /api/products` — Create product (`name`, `unit`, `selling_price`, `mrp`, `barcode`, `category_id`, `low_stock_threshold`)
- `GET /api/products` — List products (query params: `search`, `category_id`, `is_active`, `page`, `per_page`)
- `GET /api/products/<product_id>` — Get single product details
- `PUT /api/products/<product_id>` — Update product details
- `DELETE /api/products/<product_id>` — Soft-delete product (`is_active = false`)
- `POST /api/products/barcode-lookup` — Open Food Facts barcode search `{ "barcode": "890123456789" }`
- `POST /api/products/<product_id>/image` — Upload product photo (Multipart form / Base64 upload to Supabase Storage)

### 3. 📦 Inventory & Stock Control (`app.routes.inventory-routes`)
- `POST /api/inventory/stock-in` — Add stock batch `{ "product_id": "...", "quantity": 50, "cost_price": 40.0, "expiry_date": "2026-12-31" }`
- `POST /api/inventory/stock-out` — Atomic FIFO stock deduction `{ "product_id": "...", "quantity": 5, "reason": "sale" }`
- `POST /api/inventory/adjustment` — Physical count reconciliation `{ "product_id": "...", "actual_quantity": 45, "reason": "spoilage" }`
- `GET /api/inventory/stock-levels` — List stock levels & status (`ok`, `low`, `out`)
- `GET /api/inventory/transactions` — Stock audit log history
- `GET /api/inventory/batches/<product_id>` — List active stock batches for product

### 4. 🧾 Billing & POS (`app.routes.billing-routes`)
- `POST /api/billing/create` — Create POS bill with FIFO stock deduction & credit ledger entry if payment is `credit`
- `GET /api/billing/sales` — Sales transaction history (query params: `payment_mode`, `start_date`, `end_date`, `page`)
- `GET /api/billing/sales/<sale_id>` — Get single sale details
- `GET /api/billing/daily-summary` — Today's total revenue, order count, and payment mode breakdown (`cash`, `upi`, `credit`)
- `POST /api/billing/invoice/<sale_id>/generate` — Trigger PDF invoice generation & Supabase Storage upload
- `GET /api/billing/invoice/<sale_id>/share` — Returns formatted WhatsApp invoice sharing URL (`https://wa.me/?text=...`)

### 5. 📖 Digital Khata (Customer Credit) (`app.routes.khata-routes`)
- `POST /api/customers` — Create customer (`name`, `phone`, `address`, `credit_limit`)
- `GET /api/customers` — List customers with current net balance (`total_credit - total_payment`)
- `GET /api/customers/<customer_id>` — Customer profile & full credit transaction history
- `PUT /api/customers/<customer_id>` — Update customer info
- `POST /api/khata/credit` — Add udhari credit entry `{ "customer_id": "...", "amount": 150.0, "note": "Weekly ration" }`
- `POST /api/khata/payment` — Record payment entry with over-payment protection `{ "customer_id": "...", "amount": 100.0, "payment_mode": "cash" }`
- `GET /api/khata/outstanding` — Outstanding customer list sorted by highest balance
- `GET /api/khata/summary` — Aggregate Khata stats (total outstanding balance, customer count)

### 6. 🚛 Supplier & Purchase Orders (`app.routes.supplier-routes`)
- `POST /api/suppliers` — Add supplier (`name`, `phone`, `items_supplied`)
- `GET /api/suppliers` — List suppliers
- `GET /api/suppliers/<supplier_id>` — Supplier details & PO history
- `PUT /api/suppliers/<supplier_id>` — Update supplier
- `DELETE /api/suppliers/<supplier_id>` — Delete supplier (Returns 409 Conflict if active POs exist)
- `POST /api/purchase-orders` — Create PO in `draft` status
- `GET /api/purchase-orders` — List POs (query params: `status`, `supplier_id`)
- `GET /api/purchase-orders/<po_id>` — Single PO details
- `PUT /api/purchase-orders/<po_id>` — Update PO status enforcing state machine (`draft` -> `sent` -> `received`)
- `DELETE /api/purchase-orders/<po_id>` — Delete draft PO
- `GET /api/purchase-orders/<po_id>/share` — Return WhatsApp PO order link (`https://wa.me/{phone}?text=...`)

### 7. 📊 Dashboard Metrics (`app.routes.dashboard-routes`)
- `GET /api/dashboard/summary` — Real-time metrics (`total_products`, `total_inventory_value`, `low_stock_count`, `expiring_soon_count`, `today_sales_revenue`, `today_sales_count`)
- `GET /api/dashboard/expiry-alerts` — Expiring stock categorized into 1-day, 3-day, and 7-day urgency buckets
- `GET /api/dashboard/low-stock-alerts` — Products at or below threshold
- `GET /api/dashboard/recent-sales` — Last 5 sales summary

### 8. 📈 Analytics & Reports (`app.routes.analytics-routes`)
- `GET /api/analytics/fast-moving` — Top N items by sales quantity
- `GET /api/analytics/slow-moving` — Least-selling / dead stock items
- `GET /api/analytics/sales-trends` — Daily revenue and order counts over time (formatted for Recharts)
- `GET /api/analytics/inventory-value` — Inventory valuation grouped by product category

### 9. 🔔 Notifications & Alerts (`app.routes.alert-routes`)
- `POST /api/alerts/generate` — Automated scan & deduplicated alert creation
- `GET /api/alerts` — List store alerts (query params: `type`, `severity`, `is_read`, `page`)
- `PUT /api/alerts/<alert_id>/read` — Mark single alert as read
- `PUT /api/alerts/read-all` — Mark all alerts as read
- `GET /api/alerts/unread-count` — Badge counter `{ "unread_count": 4 }`

---

## 💻 Frontend TypeScript Type Definitions

When creating state management, API client services (Axios / Fetch), and components, use these exact interfaces matching backend schemas:

```typescript
export interface Product {
  id: string;
  store_id: string;
  category_id?: string;
  name: string;
  barcode?: string;
  brand?: string;
  unit: string;
  mrp: number;
  selling_price: number;
  purchase_price?: number;
  low_stock_threshold: number;
  current_stock: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface StockBatch {
  id: string;
  store_id: string;
  product_id: string;
  batch_number: string;
  initial_quantity: number;
  quantity_remaining: number;
  cost_price: number;
  expiry_date?: string;
  created_at: string;
}

export interface BillItemRequest {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateBillRequest {
  customer_id?: string;
  items: BillItemRequest[];
  discount?: number;
  payment_mode: 'cash' | 'upi' | 'credit';
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone?: string;
  address?: string;
  credit_limit?: number;
  total_credit: number;
  total_payment: number;
  balance: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  store_id: string;
  name: string;
  phone?: string;
  items_supplied?: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  store_id: string;
  supplier_id: string;
  po_number: string;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  total_amount: number;
  items: Array<{
    product_name: string;
    quantity: number;
    estimated_cost?: number;
  }>;
  created_at: string;
}

export interface Alert {
  id: string;
  store_id: string;
  type: 'expiry' | 'low_stock';
  product_id?: string;
  batch_id?: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  created_at: string;
}
```

---

## 🧪 Testing Coverage

The backend has **32/32 Pytest unit tests** passing with 100% success rate across all 9 modules.

To execute the test suite:
```bash
./venv/bin/pytest
```
