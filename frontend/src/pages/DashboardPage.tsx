import React from 'react';
import { Card } from '../components/shared';

export const DashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Dashboard Overview" subtitle="Real-time Kirana store performance">
        <p style={{ color: 'var(--text-muted)' }}>
          Dashboard metrics and charts will be rendered here in Unit 12.
        </p>
      </Card>
    </div>
  );
};
export default DashboardPage;
