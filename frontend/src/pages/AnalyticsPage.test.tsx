import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { AnalyticsPage } from './AnalyticsPage';

vi.mock('../services/analytics', () => ({
  analyticsService: {
    getFastMoving: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          product_id: 'prod-1',
          product_name: 'Amul Butter 500g',
          total_quantity_sold: 45,
          total_revenue: 12150.0,
        },
      ],
    }),
    getSlowMoving: vi.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    getSalesTrends: vi.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    getInventoryValueByCategory: vi.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
  },
}));

describe('AnalyticsPage Component', () => {
  it('renders Analytics title, tab buttons, and period filter chips', async () => {
    render(
      <BrowserRouter>
        <AnalyticsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Store Analytics & Business Intelligence')).toBeInTheDocument();
    expect(screen.getByText('🔥 Fast Moving Items')).toBeInTheDocument();
    expect(screen.getByText('⏳ Slow Moving (Dead Stock)')).toBeInTheDocument();
    expect(screen.getByText('📈 Sales Revenue Trends')).toBeInTheDocument();
    expect(screen.getByText('📊 Inventory Category Value')).toBeInTheDocument();
  });
});
