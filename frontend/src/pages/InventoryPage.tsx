import React from 'react';
import { Card } from '../components/shared';

export const InventoryPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Inventory & Stock Control" subtitle="Stock-in batches, physical count adjustment, and audit log">
        <p style={{ color: 'var(--text-muted)' }}>
          Inventory stock control interface will be rendered here in Unit 15.
        </p>
      </Card>
    </div>
  );
};
export default InventoryPage;
