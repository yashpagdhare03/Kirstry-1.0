import { useState, useEffect, useCallback } from 'react';
import {
  dashboardService,
  type DashboardSummary,
  type ExpiryAlert,
  type LowStockAlert,
  type RecentSale,
} from '../services/dashboard';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, expiryRes, lowStockRes, salesRes] = await Promise.all([
        dashboardService.getSummary().catch(() => null),
        dashboardService.getExpiryAlerts(7).catch(() => null),
        dashboardService.getLowStockAlerts().catch(() => null),
        dashboardService.getRecentSales(5).catch(() => null),
      ]);

      if (summaryRes && summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (expiryRes && expiryRes.success && Array.isArray(expiryRes.data)) {
        setExpiryAlerts(expiryRes.data);
      }
      if (lowStockRes && lowStockRes.success && Array.isArray(lowStockRes.data)) {
        setLowStockAlerts(lowStockRes.data);
      }
      if (salesRes && salesRes.success && Array.isArray(salesRes.data)) {
        setRecentSales(salesRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  return {
    summary,
    expiryAlerts: Array.isArray(expiryAlerts) ? expiryAlerts : [],
    lowStockAlerts: Array.isArray(lowStockAlerts) ? lowStockAlerts : [],
    recentSales: Array.isArray(recentSales) ? recentSales : [],
    loading,
    error,
    refreshDashboard: fetchAllDashboardData,
  };
}
