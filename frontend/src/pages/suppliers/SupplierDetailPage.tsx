import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supplierService, type Supplier } from '../../services/supplier';
import { Button, Card, Skeleton } from '../../components/shared';
import { ArrowLeft, Phone, Package, PlusCircle, Trash2, Eye } from 'lucide-react';
import styles from './SupplierPages.module.css';

export const SupplierDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSupplier = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await supplierService.getSupplier(id);
      if (res.success && res.data) {
        setSupplier(res.data);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplier();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !supplier) return;
    if (!window.confirm(`Are you sure you want to delete supplier '${supplier.name}'?`)) return;

    setError(null);
    try {
      const res = await supplierService.deleteSupplier(id);
      if (res.success) {
        navigate('/suppliers');
      } else {
        setError((res as any).message || 'Failed to delete supplier');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting supplier. Make sure there are no active purchase orders linked.');
    }
  };

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

  const pos = supplier?.purchase_orders || [];

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{supplier ? supplier.name : 'Supplier Profile'}</h1>
          <p className={styles.subtitle}>Supplier details and purchase order fulfillment history</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/suppliers')}
        >
          Back to Directory
        </Button>
      </div>

      {error && (
        <Card style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>{error}</div>
        </Card>
      )}

      {loading ? (
        <Skeleton height={300} />
      ) : !supplier ? (
        <Card>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Supplier profile not found
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile Overview Card */}
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{supplier.name}</h2>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {supplier.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} /> {supplier.phone}
                      </span>
                    )}
                    {supplier.items_supplied && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Package size={14} /> {supplier.items_supplied}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="primary"
                    leftIcon={<PlusCircle size={16} />}
                    onClick={() => navigate(`/suppliers/${id}/purchase-order/new`)}
                  >
                    Create Purchase Order
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<Trash2 size={16} />}
                    onClick={handleDelete}
                  >
                    Delete Supplier
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Linked PO History Table */}
          <Card>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Purchase Order History ({pos.length})
            </h3>

            {pos.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No purchase orders created for this supplier yet.
              </div>
            ) : (
              <div className="table-responsive-container">
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Date</th>
                      <th>Items Count</th>
                      <th>Est. Total Cost</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pos.map((po) => {
                      const poid = po.po_id || po.id;
                      return (
                        <tr key={poid}>
                          <td>
                            <strong className="font-mono">{po.po_number}</strong>
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
                              View PO
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
      )}
    </div>
  );
};

export default SupplierDetailPage;
