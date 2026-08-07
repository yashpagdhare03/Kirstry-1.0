import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

// Mock dashboard service
vi.mock('../services/dashboard', () => ({
  dashboardService: {
    getSummary: vi.fn().mockResolvedValue({
      success: true,
      data: {
        total_products: 45,
        total_categories: 6,
        total_inventory_value: 125000,
        low_stock_count: 3,
        expiring_soon_count: 2,
        today_sales_count: 14,
        today_sales_revenue: 18500,
      },
    }),
    getExpiryAlerts: vi.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    getLowStockAlerts: vi.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    getRecentSales: vi.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
  },
}));

describe('DashboardPage Component', () => {
  it('renders store overview title and quick action buttons', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Store Overview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new pos bill/i })).toBeInTheDocument();
  });
});
