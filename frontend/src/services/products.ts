import { api } from './api';

export interface Category {
  category_id: string;
  name: string;
  description?: string;
}

export interface Product {
  product_id: string;
  store_id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  brand?: string;
  unit: string;
  barcode?: string;
  mrp: number;
  selling_price: number;
  purchase_price: number;
  reorder_threshold: number;
  image_url?: string;
  is_active: boolean;
  total_stock?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductPayload {
  category_id?: string;
  name: string;
  brand?: string;
  unit: string;
  barcode?: string;
  mrp: number;
  selling_price: number;
  purchase_price: number;
  reorder_threshold?: number;
  image_url?: string;
}

export interface BarcodeLookupResult {
  found: boolean;
  barcode: string;
  product_name?: string;
  brand?: string;
  category?: string;
  mrp?: number;
  image_url?: string;
  source?: string;
}

export const productService = {
  async getCategories() {
    return api.get<Category[]>('/categories');
  },

  async getProducts(params?: { search?: string; category_id?: string; is_active?: boolean }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category_id) query.append('category_id', params.category_id);
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<Product[]>(`/products${queryString}`);
  },

  async getProduct(id: string) {
    return api.get<Product>(`/products/${id}`);
  },

  async createProduct(payload: ProductPayload) {
    return api.post<Product>('/products', payload);
  },

  async updateProduct(id: string, payload: Partial<ProductPayload>) {
    return api.put<Product>(`/products/${id}`, payload);
  },

  async deleteProduct(id: string) {
    return api.delete<{ message: string }>(`/products/${id}`);
  },

  async lookupBarcode(barcode: string) {
    return api.get<BarcodeLookupResult>(`/products/barcode-lookup?barcode=${encodeURIComponent(barcode)}`);
  },

  async uploadProductImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ image_url: string }>('/products/upload-image', formData);
  },
};
