import { api } from './api';

export interface DashboardSummary {
  total_products: number;
  total_categories: number;
  total_inventory_value: number;
  low_stock_count: number;
  expiring_soon_count: number;
  today_sales_count: number;
  today_sales_revenue: number;
}

export interface ExpiryAlert {
  batch_id: string;
  product_id: string;
  product_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  days_until_expiry: number;
  urgency: '1_day' | '3_days' | '7_days';
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  category_name?: string;
  current_stock: number;
  reorder_threshold: number;
  deficit: number;
}

export interface RecentSale {
  sale_id: string;
  invoice_number: string;
  created_at: string;
  customer_name?: string;
  total_amount: number;
  payment_mode: 'cash' | 'upi' | 'credit';
  item_count: number;
}

export const dashboardService = {
  async getSummary() {
    return api.get<DashboardSummary>('/dashboard/summary');
  },

  async getExpiryAlerts(days: number = 7) {
    return api.get<ExpiryAlert[]>(`/dashboard/expiry-alerts?days=${days}`);
  },

  async getLowStockAlerts() {
    return api.get<LowStockAlert[]>('/dashboard/low-stock-alerts');
  },

  async getRecentSales(limit: number = 5) {
    return api.get<RecentSale[]>(`/dashboard/recent-sales?limit=${limit}`);
  },
};
