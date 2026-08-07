import { api } from './api';

export interface CreditTransaction {
  id: string;
  store_id: string;
  customer_id: string;
  type: 'credit' | 'payment';
  amount: number;
  sale_id?: string;
  due_date?: string;
  payment_mode?: string;
  note?: string;
  created_at: string;
}

export interface Customer {
  id?: string;
  customer_id: string;
  store_id: string;
  name: string;
  phone?: string;
  address?: string;
  credit_limit?: number;
  outstanding_balance: number;
  created_at: string;
  transactions?: CreditTransaction[];
}

export interface KhataSummary {
  total_outstanding: number;
  total_customers_with_credit: number;
  total_credit_given?: number;
  total_payments_collected?: number;
}

export interface CreateCustomerPayload {
  name: string;
  phone?: string;
  address?: string;
  credit_limit?: number;
}

export interface CreditEntryPayload {
  customer_id: string;
  amount: number;
  due_date?: string;
  note?: string;
}

export interface PaymentEntryPayload {
  customer_id: string;
  amount: number;
  payment_mode?: string;
  note?: string;
}

export const khataService = {
  async getCustomers(params?: { search?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ customers: Customer[]; total: number; page: number; per_page: number }>(`/customers${queryString}`);
  },

  async getCustomer(customerId: string) {
    return api.get<Customer>(`/customers/${customerId}`);
  },

  async createCustomer(payload: CreateCustomerPayload) {
    return api.post<Customer>('/customers', payload);
  },

  async updateCustomer(customerId: string, payload: Partial<CreateCustomerPayload>) {
    return api.put<Customer>(`/customers/${customerId}`, payload);
  },

  async recordCredit(payload: CreditEntryPayload) {
    return api.post<{ transaction: CreditTransaction; new_balance: number }>('/khata/credit', payload);
  },

  async recordPayment(payload: PaymentEntryPayload) {
    return api.post<{ transaction: CreditTransaction; new_balance: number }>('/khata/payment', payload);
  },

  async getOutstandingCustomers(params?: { page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<{ customers: Customer[]; total: number; page: number; per_page: number }>(`/khata/outstanding${queryString}`);
  },

  async getKhataSummary() {
    return api.get<KhataSummary>('/khata/summary');
  },
};
