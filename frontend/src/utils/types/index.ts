/**
 * Kirstry 1.0 — Frontend TypeScript Type Definitions
 * Matches backend database models and API payload envelopes.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id?: string | null;
  categories?: { name: string } | null;
  name: string;
  barcode?: string | null;
  brand?: string | null;
  unit: string;
  mrp: number;
  selling_price: number;
  purchase_price?: number | null;
  low_stock_threshold: number;
  current_stock: number;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockBatch {
  id: string;
  store_id: string;
  product_id: string;
  products?: { name: string; unit: string } | null;
  batch_number: string;
  initial_quantity: number;
  quantity_remaining: number;
  cost_price: number;
  expiry_date?: string | null;
  created_at: string;
}

export interface StockTransaction {
  id: string;
  store_id: string;
  product_id: string;
  batch_id?: string | null;
  type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  reason?: string | null;
  created_at: string;
}

export interface BillItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

export interface CreateBillRequest {
  customer_id?: string | null;
  items: BillItem[];
  discount?: number;
  payment_mode: 'cash' | 'upi' | 'credit';
}

export interface Sale {
  id: string;
  store_id: string;
  customer_id?: string | null;
  customers?: { name: string; phone?: string } | null;
  invoice_number: string;
  subtotal: number;
  discount: number;
  total_amount: number;
  payment_mode: 'cash' | 'upi' | 'credit';
  items_count: number;
  invoice_url?: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  credit_limit?: number | null;
  total_credit: number;
  total_payment: number;
  balance: number;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  store_id: string;
  customer_id: string;
  type: 'credit' | 'payment';
  amount: number;
  due_date?: string | null;
  note?: string | null;
  sale_id?: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  store_id: string;
  name: string;
  phone?: string | null;
  items_supplied?: string | null;
  created_at: string;
  purchase_orders?: PurchaseOrder[];
}

export interface POItem {
  product_id?: string | null;
  product_name: string;
  quantity: number;
  estimated_cost?: number | null;
}

export interface PurchaseOrder {
  id: string;
  store_id: string;
  supplier_id: string;
  suppliers?: { name: string; phone?: string } | null;
  po_number: string;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  total_amount: number;
  items: POItem[];
  notes?: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  store_id: string;
  type: 'expiry' | 'low_stock';
  product_id?: string | null;
  batch_id?: string | null;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  created_at: string;
}

export interface DashboardSummary {
  total_products: number;
  total_inventory_value: number;
  low_stock_count: number;
  expiring_soon_count: number;
  today_sales_revenue: number;
  today_sales_count: number;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  orders_count: number;
}

export interface CategoryValuation {
  category: string;
  total_quantity: number;
  total_value: number;
}
