import { api } from './api';
import type {
  DashboardSummary,
  Product,
  Sale,
  StockBatch,
} from '../utils/types';

export interface ExpiryAlertsData {
  total_expiring_count: number;
  bucket_1_day: (StockBatch & { urgency: string; days_until_expiry: number })[];
  bucket_3_days: (StockBatch & { urgency: string; days_until_expiry: number })[];
  bucket_7_days: (StockBatch & { urgency: string; days_until_expiry: number })[];
  items: (StockBatch & { urgency: string; days_until_expiry: number })[];
}

export async function fetchDashboardSummary() {
  const res = await api.get<DashboardSummary>('/dashboard/summary');
  return res.data;
}

export async function fetchExpiryAlerts(days: number = 7) {
  const res = await api.get<ExpiryAlertsData>('/dashboard/expiry-alerts', {
    params: { days },
  });
  return res.data;
}

export async function fetchLowStockAlerts() {
  const res = await api.get<Product[]>('/dashboard/low-stock-alerts');
  return res.data;
}

export async function fetchRecentSales(limit: number = 5) {
  const res = await api.get<Sale[]>('/dashboard/recent-sales', {
    params: { limit },
  });
  return res.data;
}
