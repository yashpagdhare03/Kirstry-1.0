import { api } from './api';

export interface POItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  estimated_cost?: number;
}

export interface PurchaseOrder {
  id?: string;
  po_id?: string;
  store_id: string;
  supplier_id: string;
  po_number: string;
  status: 'draft' | 'sent' | 'received' | 'cancelled' | string;
  items: POItem[];
  total_estimated_cost: number;
  notes?: string;
  created_at: string;
  suppliers?: {
    name: string;
    phone?: string;
  };
}

export interface Supplier {
  id?: string;
  supplier_id: string;
  store_id: string;
  name: string;
  phone?: string;
  items_supplied?: string;
  created_at: string;
  purchase_orders?: PurchaseOrder[];
}

export interface CreateSupplierPayload {
  name: string;
  phone?: string;
  items_supplied?: string;
}

export interface CreatePOPayload {
  supplier_id: string;
  items: POItem[];
  notes?: string;
}

export interface UpdatePOPayload {
  status?: string;
  items?: POItem[];
  notes?: string;
}

export const supplierService = {
  async getSuppliers(params?: { search?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ suppliers: Supplier[]; total: number; page: number; per_page: number }>(`/suppliers${queryString}`);
  },

  async getSupplier(supplierId: string) {
    return api.get<Supplier>(`/suppliers/${supplierId}`);
  },

  async createSupplier(payload: CreateSupplierPayload) {
    return api.post<Supplier>('/suppliers', payload);
  },

  async updateSupplier(supplierId: string, payload: Partial<CreateSupplierPayload>) {
    return api.put<Supplier>(`/suppliers/${supplierId}`, payload);
  },

  async deleteSupplier(supplierId: string) {
    return api.delete<{ id: string }>(`/suppliers/${supplierId}`);
  },

  async createPurchaseOrder(payload: CreatePOPayload) {
    return api.post<PurchaseOrder>('/purchase-orders', payload);
  },

  async getPurchaseOrders(params?: { supplier_id?: string; status?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.supplier_id) query.append('supplier_id', params.supplier_id);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ purchase_orders: PurchaseOrder[]; total: number; page: number; per_page: number }>(`/purchase-orders${queryString}`);
  },

  async getPurchaseOrder(poId: string) {
    return api.get<PurchaseOrder>(`/purchase-orders/${poId}`);
  },

  async updatePurchaseOrder(poId: string, payload: UpdatePOPayload) {
    return api.put<PurchaseOrder>(`/purchase-orders/${poId}`, payload);
  },

  async deletePurchaseOrder(poId: string) {
    return api.delete<{ id: string }>(`/purchase-orders/${poId}`);
  },

  async getWhatsappShareLink(poId: string) {
    return api.get<{ whatsapp_url: string }>(`/purchase-orders/${poId}/share`);
  },
};
