import React from 'react';
import { Card } from '../components/shared';

export const AlertsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Notifications & Expiry Alerts" subtitle="Low stock warnings and expiring stock notifications">
        <p style={{ color: 'var(--text-muted)' }}>
          Alerts notification center will be rendered here.
        </p>
      </Card>
    </div>
  );
};
export default AlertsPage;
