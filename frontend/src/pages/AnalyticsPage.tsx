import React from 'react';
import { Card } from '../components/shared';

export const AnalyticsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Sales Reports & Analytics" subtitle="Recharts analytics, fast/slow moving items, and category valuation">
        <p style={{ color: 'var(--text-muted)' }}>
          Analytics & Reports interface will be rendered here in Unit 18.
        </p>
      </Card>
    </div>
  );
};
export default AnalyticsPage;
