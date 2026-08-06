import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService, type StockLevelItem } from '../../services/inventory';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import {
  Boxes,
  PlusCircle,
  MinusCircle,
  Sliders,
  History,
  Layers,
} from 'lucide-react';
import styles from './InventoryPages.module.css';

export const StockLevelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<StockLevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ok' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');

  const fetchStockLevels = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getStockLevels({
        status: activeTab === 'all' ? undefined : activeTab,
        search: search || undefined,
      });
      if (res.success && res.data) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockLevels();
  }, [activeTab, search]);

  const getStatusBadge = (status: 'ok' | 'low' | 'out') => {
    switch (status) {
      case 'ok':
        return <span className={`${styles.statusBadge} ${styles.badgeOk}`}>Optimal Stock</span>;
      case 'low':
        return <span className={`${styles.statusBadge} ${styles.badgeLow}`}>Low Stock Warning</span>;
      case 'out':
        return <span className={`${styles.statusBadge} ${styles.badgeOut}`}>Out of Stock</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Inventory & Stock Levels</h1>
          <p className={styles.subtitle}>Track real-time stock balances, batch limits, and low stock warnings</p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<History size={16} />}
            onClick={() => navigate('/inventory/transactions')}
          >
            Audit Trail
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sliders size={16} />}
            onClick={() => navigate('/inventory/adjustment')}
          >
            Reconcile Count
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<MinusCircle size={16} />}
            onClick={() => navigate('/inventory/stock-out')}
          >
            Stock Out
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusCircle size={16} />}
            onClick={() => navigate('/inventory/stock-in')}
          >
            Stock In
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className={styles.filterControls}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Stock Items
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'ok' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ok')}
          >
            Optimal Stock (OK)
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'low' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('low')}
          >
            Low Stock
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'out' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('out')}
          >
            Out of Stock
          </button>
        </div>

        <div className={styles.searchBox}>
          <Input
            placeholder="Search by name, brand, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stock Levels Table Card */}
      <Card>
        {loading ? (
          <Skeleton height={300} />
        ) : items.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Boxes size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              No inventory items match criteria
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Try adjusting your filter tabs or search keywords.
            </p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Status</th>
                  <th>Current Stock</th>
                  <th>Reorder Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.productCell}>
                        <span className={styles.productName}>{item.name}</span>
                        <span className={styles.productSub}>
                          {item.brand ? `${item.brand} • ` : ''}
                          {item.categories?.name ? `${item.categories.name} • ` : ''}
                          {item.barcode ? `Barcode: ${item.barcode}` : ''}
                        </span>
                      </div>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <span
                        className="font-mono"
                        style={{
                          fontWeight: 700,
                          fontSize: '15px',
                          color:
                            item.status === 'out'
                              ? 'var(--state-error)'
                              : item.status === 'low'
                              ? 'var(--state-warning)'
                              : 'var(--text-primary)',
                        }}
                      >
                        {item.current_stock} {item.unit}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                        {item.low_stock_threshold || 10} {item.unit}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Layers size={14} />}
                          onClick={() => navigate(`/inventory/batches/${item.id}`)}
                        >
                          Batches
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<PlusCircle size={14} />}
                          onClick={() => navigate('/inventory/stock-in', { state: { product_id: item.id } })}
                        >
                          In
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<MinusCircle size={14} />}
                          onClick={() => navigate('/inventory/stock-out', { state: { product_id: item.id } })}
                        >
                          Out
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StockLevelsPage;
