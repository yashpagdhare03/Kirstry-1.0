import { api } from './api';

export interface FastMovingItem {
  product_id: string;
  product_name: string;
  total_quantity_sold: number;
  total_revenue: number;
}

export interface SlowMovingItem {
  product_id: string;
  product_name: string;
  total_quantity_sold: number;
  current_stock: number;
  days_since_last_sale?: number;
}

export interface SalesTrendData {
  date: string;
  revenue: number;
  orders_count: number;
}

export interface CategoryValueData {
  category_name: string;
  total_items: number;
  total_stock_quantity: number;
  total_valuation: number;
}

export const analyticsService = {
  async getFastMoving(params?: { limit?: number; days?: number }) {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.days) query.append('days', String(params.days));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<FastMovingItem[]>(`/analytics/fast-moving${queryString}`);
  },

  async getSlowMoving(params?: { limit?: number; days?: number }) {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.days) query.append('days', String(params.days));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<SlowMovingItem[]>(`/analytics/slow-moving${queryString}`);
  },

  async getSalesTrends(params?: { timeframe?: string; days?: number }) {
    const query = new URLSearchParams();
    if (params?.timeframe) query.append('timeframe', params.timeframe);
    if (params?.days) query.append('days', String(params.days));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<SalesTrendData[]>(`/analytics/sales-trends${queryString}`);
  },

  async getInventoryValueByCategory() {
    return api.get<CategoryValueData[]>('/analytics/inventory-value');
  },
};
