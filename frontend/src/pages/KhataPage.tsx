import React from 'react';
import { Card } from '../components/shared';

export const KhataPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Digital Khata" subtitle="Customer credit ledger, payments, and outstanding balances">
        <p style={{ color: 'var(--text-muted)' }}>
          Digital Khata interface will be rendered here in Unit 16.
        </p>
      </Card>
    </div>
  );
};
export default KhataPage;
