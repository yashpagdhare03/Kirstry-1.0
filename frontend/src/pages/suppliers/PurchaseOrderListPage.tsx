import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supplierService, type PurchaseOrder } from '../../services/supplier';
import { Button, Card, Skeleton } from '../../components/shared';
import { ArrowLeft, Eye, ShoppingBag } from 'lucide-react';
import styles from './SupplierPages.module.css';

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getPurchaseOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      if (res.success && res.data) {
        setPos(res.data.purchase_orders || []);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, [statusFilter]);

  const getPoBadge = (status: string) => {
    const st = (status || 'draft').toLowerCase();
    switch (st) {
      case 'draft':
        return <span className={`${styles.poBadge} ${styles.statusDraft}`}>Draft</span>;
      case 'sent':
        return <span className={`${styles.poBadge} ${styles.statusSent}`}>Sent</span>;
      case 'received':
        return <span className={`${styles.poBadge} ${styles.statusReceived}`}>Received</span>;
      case 'cancelled':
        return <span className={`${styles.poBadge} ${styles.statusCancelled}`}>Cancelled</span>;
      default:
        return <span className={styles.poBadge}>{st}</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Purchase Orders</h1>
          <p className={styles.subtitle}>Track wholesale procurement orders, dispatch statuses, and vendor receipts</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/suppliers')}
        >
          Back to Directory
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all', 'draft', 'sent', 'received', 'cancelled'].map((st) => (
          <Button
            key={st}
            variant={statusFilter === st ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(st)}
            style={{ textTransform: 'capitalize' }}
          >
            {st}
          </Button>
        ))}
      </div>

      {/* Purchase Orders Table */}
      <Card>
        {loading ? (
          <Skeleton height={300} />
        ) : pos.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              No purchase orders found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Select a supplier from the directory to create purchase orders.
            </p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Items Count</th>
                  <th>Total Est. Cost</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po) => {
                  const poid = po.po_id || po.id;
                  const supplierName = po.suppliers?.name || 'Supplier';
                  return (
                    <tr key={poid}>
                      <td>
                        <strong className="font-mono">{po.po_number}</strong>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{supplierName}</strong>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(po.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono">{po.items?.length || 0}</span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          ₹{(po.total_estimated_cost || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>{getPoBadge(po.status)}</td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye size={14} />}
                          onClick={() => navigate(`/purchase-orders/${poid}`)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PurchaseOrderListPage;
