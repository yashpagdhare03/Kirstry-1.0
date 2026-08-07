import { api } from './api';

export interface BillItemPayload {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateBillPayload {
  items: BillItemPayload[];
  payment_mode: 'cash' | 'upi' | 'credit' | string;
  customer_id?: string;
  discount?: number;
  notes?: string;
}

export interface SaleItemRecord {
  id: string;
  sale_id: string;
  product_id: string;
  batch_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: {
    name: string;
    unit: string;
  };
}

export interface SaleRecord {
  id: string;
  store_id: string;
  invoice_number: string;
  items_count: number;
  subtotal: number;
  total_amount: number;
  discount: number;
  payment_mode: string;
  customer_id?: string;
  invoice_url?: string;
  created_at: string;
  customers?: {
    name: string;
    phone?: string;
    address?: string;
  };
  sale_items?: SaleItemRecord[];
}

export interface DailySummary {
  date: string;
  total_sales_count: number;
  total_revenue: number;
  total_items_sold: number;
  payment_mode_breakdown: {
    cash: number;
    upi: number;
    credit: number;
  };
}

export const billingService = {
  async createBill(payload: CreateBillPayload) {
    return api.post<SaleRecord>('/billing/create', payload);
  },

  async getSales(params?: { date_from?: string; date_to?: string; payment_mode?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.date_from) query.append('date_from', params.date_from);
    if (params?.date_to) query.append('date_to', params.date_to);
    if (params?.payment_mode) query.append('payment_mode', params.payment_mode);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ sales: SaleRecord[]; total: number; page: number; per_page: number }>(`/billing/sales${queryString}`);
  },

  async getSale(saleId: string) {
    return api.get<SaleRecord>(`/billing/sales/${saleId}`);
  },

  async getDailySummary(date?: string) {
    const query = date ? `?date=${date}` : '';
    return api.get<DailySummary>(`/billing/daily-summary${query}`);
  },

  async generateInvoicePdf(saleId: string) {
    return api.post<{ invoice_url: string }>(`/billing/invoice/${saleId}/generate`, {});
  },

  async getWhatsappShareLink(saleId: string) {
    return api.get<{ whatsapp_url: string }>(`/billing/invoice/${saleId}/share`);
  },
};
