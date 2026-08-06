import { api } from './api';

export interface StockLevelItem {
  id: string;
  store_id: string;
  name: string;
  brand?: string;
  unit: string;
  barcode?: string;
  category_id?: string;
  low_stock_threshold: number;
  current_stock: number;
  status: 'ok' | 'low' | 'out';
  categories?: {
    name: string;
  };
}

export interface StockInPayload {
  product_id: string;
  quantity: number;
  batch_number?: string;
  expiry_date?: string;
  purchase_date?: string;
  supplier_id?: string;
  cost_price?: number;
  notes?: string;
}

export interface StockOutPayload {
  product_id: string;
  quantity: number;
  reason: string;
  reference_id?: string;
  notes?: string;
}

export interface AdjustmentPayload {
  product_id: string;
  batch_id: string;
  new_quantity: number;
  notes?: string;
}

export interface StockTransaction {
  id: string;
  store_id: string;
  product_id: string;
  batch_id?: string;
  type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  reason?: string;
  notes?: string;
  created_at: string;
  products?: {
    name: string;
    unit: string;
  };
}

export interface StockBatch {
  id: string;
  store_id: string;
  product_id: string;
  batch_number: string;
  initial_quantity: number;
  quantity_remaining: number;
  expiry_date?: string;
  purchase_date?: string;
  cost_price?: number;
  created_at: string;
  suppliers?: {
    name: string;
  };
}

export const inventoryService = {
  async getStockLevels(params?: { status?: string; search?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ items: StockLevelItem[]; total: number; page: number; per_page: number }>(`/inventory/stock-levels${queryString}`);
  },

  async recordStockIn(payload: StockInPayload) {
    return api.post<{ batch: StockBatch; transaction: StockTransaction }>('/inventory/stock-in', payload);
  },

  async recordStockOut(payload: StockOutPayload) {
    return api.post<{ product_id: string; requested_quantity: number; remaining_stock: number; transactions: StockTransaction[] }>('/inventory/stock-out', payload);
  },

  async recordAdjustment(payload: AdjustmentPayload) {
    return api.post<{ batch_id: string; previous_quantity: number; new_quantity: number; difference: number; transaction: StockTransaction }>('/inventory/adjustment', payload);
  },

  async getTransactions(params?: { product_id?: string; type?: string; reason?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.product_id) query.append('product_id', params.product_id);
    if (params?.type) query.append('type', params.type);
    if (params?.reason) query.append('reason', params.reason);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ transactions: StockTransaction[]; total: number; page: number; per_page: number }>(`/inventory/transactions${queryString}`);
  },

  async getBatches(productId: string) {
    return api.get<StockBatch[]>(`/inventory/batches/${productId}`);
  },
};
