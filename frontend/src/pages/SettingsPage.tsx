import React from 'react';
import { Card } from '../components/shared';

export const SettingsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Store Settings" subtitle="Store profile, tax settings, and user preferences">
        <p style={{ color: 'var(--text-muted)' }}>
          Settings interface will be rendered here in Unit 19.
        </p>
      </Card>
    </div>
  );
};
export default SettingsPage;
