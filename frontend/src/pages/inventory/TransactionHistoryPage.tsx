import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService, type StockTransaction } from '../../services/inventory';
import { Button, Card, Skeleton } from '../../components/shared';
import { ArrowLeft, History } from 'lucide-react';
import styles from './InventoryPages.module.css';

export const TransactionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getTransactions({
        type: activeType === 'all' ? undefined : activeType,
      });
      if (res.success && res.data) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeType]);

  const getTypeBadge = (type: 'stock_in' | 'stock_out' | 'adjustment') => {
    switch (type) {
      case 'stock_in':
        return <span className={`${styles.statusBadge} ${styles.badgeStockIn}`}>Stock In</span>;
      case 'stock_out':
        return <span className={`${styles.statusBadge} ${styles.badgeStockOut}`}>Stock Out</span>;
      case 'adjustment':
        return <span className={`${styles.statusBadge} ${styles.badgeAdjustment}`}>Adjustment</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Inventory Audit Trail</h1>
          <p className={styles.subtitle}>Immutable, append-only log of all stock movements and count adjustments</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/inventory')}
        >
          Back to Stock Levels
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterControls}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeType === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveType('all')}
          >
            All Movements
          </button>
          <button
            className={`${styles.tab} ${activeType === 'stock_in' ? styles.activeTab : ''}`}
            onClick={() => setActiveType('stock_in')}
          >
            Stock In
          </button>
          <button
            className={`${styles.tab} ${activeType === 'stock_out' ? styles.activeTab : ''}`}
            onClick={() => setActiveType('stock_out')}
          >
            Stock Out
          </button>
          <button
            className={`${styles.tab} ${activeType === 'adjustment' ? styles.activeTab : ''}`}
            onClick={() => setActiveType('adjustment')}
          >
            Adjustments
          </button>
        </div>
      </div>

      {/* Transactions Table Card */}
      <Card>
        {loading ? (
          <Skeleton height={300} />
        ) : transactions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <History size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              No stock transactions recorded
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Stock transactions will appear here when inventory is added or deducted.
            </p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>Movement Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(tx.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {tx.products?.name || 'Product'}
                      </span>
                    </td>
                    <td>{getTypeBadge(tx.type)}</td>
                    <td>
                      <span
                        className="font-mono"
                        style={{
                          fontWeight: 700,
                          fontSize: '14px',
                          color:
                            tx.type === 'stock_in'
                              ? 'var(--state-success)'
                              : tx.type === 'stock_out'
                              ? 'var(--state-error)'
                              : '#3B82F6',
                        }}
                      >
                        {tx.type === 'stock_in' ? `+${tx.quantity}` : tx.type === 'stock_out' ? `-${tx.quantity}` : (tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity)} {tx.products?.unit || 'units'}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '13px', color: 'var(--text-primary)' }}>
                        {tx.reason || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tx.notes || '—'}
                      </span>
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

export default TransactionHistoryPage;
