import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { StockLevelsPage } from './StockLevelsPage';

vi.mock('../../services/inventory', () => ({
  inventoryService: {
    getStockLevels: vi.fn().mockResolvedValue({
      success: true,
      data: {
        items: [
          {
            id: '1',
            store_id: 'store-1',
            name: 'Amul Butter 500g',
            brand: 'Amul',
            unit: 'pcs',
            barcode: '890123456789',
            current_stock: 25,
            low_stock_threshold: 10,
            status: 'ok',
          },
        ],
        total: 1,
        page: 1,
        per_page: 20,
      },
    }),
  },
}));

describe('StockLevelsPage Component', () => {
  it('renders inventory page title and action buttons', async () => {
    render(
      <BrowserRouter>
        <StockLevelsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Inventory & Stock Levels')).toBeInTheDocument();
    expect(screen.getByText('Stock In')).toBeInTheDocument();
    expect(screen.getByText('Stock Out')).toBeInTheDocument();
    expect(screen.getByText('Reconcile Count')).toBeInTheDocument();
    expect(screen.getByText('Audit Trail')).toBeInTheDocument();
  });
});
