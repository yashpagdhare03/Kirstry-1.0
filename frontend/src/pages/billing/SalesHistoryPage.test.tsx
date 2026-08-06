import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { SalesHistoryPage } from './SalesHistoryPage';

vi.mock('../../services/billing', () => ({
  billingService: {
    getSales: vi.fn().mockResolvedValue({
      success: true,
      data: {
        sales: [
          {
            id: 'sale-1',
            invoice_number: 'INV-20260806-0001',
            items_count: 2,
            subtotal: 100,
            total_amount: 100,
            discount: 0,
            payment_mode: 'cash',
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        per_page: 20,
      },
    }),
  },
}));

describe('SalesHistoryPage Component', () => {
  it('renders POS sales history title and action buttons', async () => {
    render(
      <BrowserRouter>
        <SalesHistoryPage />
      </BrowserRouter>
    );

    expect(screen.getByText('POS Sales History')).toBeInTheDocument();
    expect(screen.getByText('New POS Sale')).toBeInTheDocument();
    expect(screen.getByText('End-of-Day Summary')).toBeInTheDocument();
  });
});
