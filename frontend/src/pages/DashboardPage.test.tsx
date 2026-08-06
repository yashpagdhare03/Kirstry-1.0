import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

// Mock the useDashboard hook
vi.mock('../hooks/useDashboard', () => ({
  useDashboard: () => ({
    summary: {
      total_products: 42,
      total_inventory_value: 125000,
      low_stock_count: 3,
      expiring_soon_count: 1,
      today_sales_revenue: 4500,
      today_sales_count: 5,
    },
    expiryAlerts: {
      total_expiring_count: 1,
      items: [
        {
          id: 'b1',
          batch_number: 'BATCH-001',
          expiry_date: '2026-08-07',
          days_until_expiry: 1,
          urgency: '1_day',
        },
      ],
    },
    lowStockAlerts: [
      {
        id: 'p1',
        name: 'Good Day Biscuits',
        current_stock: 2,
        low_stock_threshold: 10,
        unit: 'pkts',
      },
    ],
    recentSales: [
      {
        id: 's1',
        invoice_number: 'INV-001',
        customer_name: 'Rahul Sharma',
        total_amount: 450,
        payment_mode: 'upi',
        created_at: '2026-08-06T10:00:00Z',
      },
    ],
    isLoading: false,
    error: null,
    refreshDashboard: vi.fn(),
  }),
}));

describe('DashboardPage Component', () => {
  it('renders store summary metrics correctly', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Store Overview')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('Good Day Biscuits')).toBeInTheDocument();
    expect(screen.getByText('Batch #BATCH-001')).toBeInTheDocument();
  });
});
