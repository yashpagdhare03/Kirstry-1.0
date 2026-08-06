import React from 'react';
import { Card } from '../components/shared';

export const BillingPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="POS Billing Counter" subtitle="Barcode billing, cart, and invoice generation">
        <p style={{ color: 'var(--text-muted)' }}>
          POS billing counter interface will be rendered here in Unit 13.
        </p>
      </Card>
    </div>
  );
};
export default BillingPage;
