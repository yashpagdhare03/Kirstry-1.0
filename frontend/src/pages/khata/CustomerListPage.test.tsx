import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { CustomerListPage } from './CustomerListPage';

vi.mock('../../services/khata', () => ({
  khataService: {
    getCustomers: vi.fn().mockResolvedValue({
      success: true,
      data: {
        customers: [
          {
            customer_id: 'cust-1',
            store_id: 'store-1',
            name: 'Anita Sharma',
            phone: '9876543210',
            outstanding_balance: 150.0,
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        per_page: 20,
      },
    }),
    getKhataSummary: vi.fn().mockResolvedValue({
      success: true,
      data: {
        total_outstanding: 150.0,
        total_customers_with_credit: 1,
      },
    }),
  },
}));

describe('CustomerListPage Component', () => {
  it('renders Digital Khata title and action buttons', async () => {
    render(
      <BrowserRouter>
        <CustomerListPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Digital Khata (Customer Credit)')).toBeInTheDocument();
    expect(screen.getByText('Add Customer')).toBeInTheDocument();
    expect(screen.getByText('Outstanding Report')).toBeInTheDocument();
  });
});
