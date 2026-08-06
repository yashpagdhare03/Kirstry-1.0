import React from 'react';
import { Card } from '../components/shared';

export const SuppliersPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Suppliers & Purchase Orders" subtitle="Supplier directory and PO workflow">
        <p style={{ color: 'var(--text-muted)' }}>
          Supplier & Purchase Order management interface will be rendered here in Unit 17.
        </p>
      </Card>
    </div>
  );
};
export default SuppliersPage;
