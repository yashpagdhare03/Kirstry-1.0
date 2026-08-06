import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboardSummary,
  fetchExpiryAlerts,
  fetchLowStockAlerts,
  fetchRecentSales,
  type ExpiryAlertsData,
} from '../services/dashboard';
import type { DashboardSummary, Product, Sale } from '../utils/types';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlertsData | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, expData, lowData, salesData] = await Promise.all([
        fetchDashboardSummary(),
        fetchExpiryAlerts(7),
        fetchLowStockAlerts(),
        fetchRecentSales(5),
      ]);
      setSummary(sumData);
      setExpiryAlerts(expData);
      setLowStockAlerts(lowData || []);
      setRecentSales(salesData || []);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err?.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    summary,
    expiryAlerts,
    lowStockAlerts,
    recentSales,
    isLoading,
    error,
    refreshDashboard,
  };
}
