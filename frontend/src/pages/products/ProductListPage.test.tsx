import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProductListPage } from './ProductListPage';

vi.mock('../../services/products', () => ({
  productService: {
    getProducts: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          product_id: 'prod-1',
          name: 'Amul Taaza Milk 1L',
          category_name: 'Dairy',
          brand: 'Amul',
          unit: 'pkt',
          barcode: '890123456789',
          mrp: 75,
          selling_price: 72,
          purchase_price: 65,
          reorder_threshold: 10,
          total_stock: 24,
          is_active: true,
        },
      ],
    }),
    getCategories: vi.fn().mockResolvedValue({
      success: true,
      data: [{ category_id: 'cat-1', name: 'Dairy' }],
    }),
    deleteProduct: vi.fn().mockResolvedValue({
      success: true,
      data: { message: 'Product deleted successfully' },
    }),
  },
}));

describe('ProductListPage Component', () => {
  it('renders products catalog title and product table rows', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ProductListPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Products Catalog')).toBeInTheDocument();
    expect(screen.getByText('Amul Taaza Milk 1L')).toBeInTheDocument();
    expect(screen.getByText('890123456789')).toBeInTheDocument();
  });
});
