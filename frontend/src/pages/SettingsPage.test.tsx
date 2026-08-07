import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { SettingsPage } from './SettingsPage';

vi.mock('../services/store', () => ({
  storeService: {
    getStoreDetails: vi.fn().mockResolvedValue({
      success: true,
      data: {
        store_id: 'store-1',
        name: 'Yash Kirana Store',
        address: 'Main Market Road',
        gstin: '27AAACK1234F1Z5',
        phone: '9822334455',
        created_at: new Date().toISOString(),
      },
    }),
    getStoreMembers: vi.fn().mockResolvedValue({
      success: true,
      data: {
        members: [
          {
            id: 'mem-1',
            store_id: 'store-1',
            email: 'owner@store.com',
            name: 'Yash Owner',
            role: 'owner',
            status: 'active',
            joined_at: new Date().toISOString(),
          },
        ],
      },
    }),
  },
}));

describe('SettingsPage Component', () => {
  it('renders Settings title and tab buttons', async () => {
    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Store Settings & Account Management')).toBeInTheDocument();
    expect(screen.getByText('🏪 Store Profile')).toBeInTheDocument();
    expect(screen.getByText('👥 Staff Management')).toBeInTheDocument();
  });
});
