import React from 'react';
import { Card } from '../components/shared';

export const ProductsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Products Catalog" subtitle="Manage store inventory catalog and Open Food Facts lookup">
        <p style={{ color: 'var(--text-muted)' }}>
          Product management interface will be rendered here in Unit 14.
        </p>
      </Card>
    </div>
  );
};
export default ProductsPage;
