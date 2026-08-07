import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { SupplierListPage } from './SupplierListPage';

vi.mock('../../services/supplier', () => ({
  supplierService: {
    getSuppliers: vi.fn().mockResolvedValue({
      success: true,
      data: {
        suppliers: [
          {
            supplier_id: 'sup-1',
            store_id: 'store-1',
            name: 'Metro Cash & Carry',
            phone: '9876543210',
            items_supplied: 'Provisions, Grains',
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

describe('SupplierListPage Component', () => {
  it('renders Supplier Directory title and action buttons', async () => {
    render(
      <BrowserRouter>
        <SupplierListPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Supplier Directory')).toBeInTheDocument();
    expect(screen.getByText('Add Supplier')).toBeInTheDocument();
    expect(screen.getByText('All Purchase Orders')).toBeInTheDocument();
  });
});
