import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supplierService, type PurchaseOrder } from '../../services/supplier';
import { Button, Card, Skeleton } from '../../components/shared';
import { ArrowLeft, Send, CheckCircle2, Share2, Trash2 } from 'lucide-react';
import styles from './SupplierPages.module.css';

export const PurchaseOrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPO = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await supplierService.getPurchaseOrder(id);
      if (res.success && res.data) {
        setPo(res.data);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPO();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await supplierService.updatePurchaseOrder(id, { status: newStatus });
      if (res.success) {
        loadPO();
      } else {
        setError((res as any).message || `Failed to update PO status to ${newStatus}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this draft purchase order?')) return;

    setActionLoading(true);
    try {
      const res = await supplierService.deletePurchaseOrder(id);
      if (res.success) {
        navigate('/purchase-orders');
      } else {
        setError((res as any).message || 'Failed to delete draft PO');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting draft PO');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWhatsappShare = async () => {
    if (!id) return;
    try {
      const res = await supplierService.getWhatsappShareLink(id);
      if (res.success && res.data?.whatsapp_url) {
        window.open(res.data.whatsapp_url, '_blank');
      }
    } catch (err: any) {
      setError('Failed to generate WhatsApp share link');
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

  const status = (po?.status || 'draft').toLowerCase();

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{po ? `Purchase Order ${po.po_number}` : 'Purchase Order'}</h1>
          <p className={styles.subtitle}>Order manifest, dispatch status, and vendor WhatsApp sharing</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/purchase-orders')}
        >
          Back to Orders
        </Button>
      </div>

      {error && (
        <Card style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>{error}</div>
        </Card>
      )}

      {loading ? (
        <Skeleton height={400} />
      ) : !po ? (
        <Card>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Purchase Order not found
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* PO Overview Header */}
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {po.po_number}
                    </h2>
                    {getPoBadge(po.status)}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Supplier: <strong>{po.suppliers?.name || 'Wholesale Vendor'}</strong>
                    {po.suppliers?.phone ? ` • Phone: ${po.suppliers.phone}` : ''}
                  </div>
                  <div className="font-mono" style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Created Date: {new Date(po.created_at).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Status Transition Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Button
                    variant="outline"
                    leftIcon={<Share2 size={16} />}
                    onClick={handleWhatsappShare}
                  >
                    Share via WhatsApp
                  </Button>

                  {status === 'draft' && (
                    <>
                      <Button
                        variant="primary"
                        isLoading={actionLoading}
                        leftIcon={<Send size={16} />}
                        onClick={() => handleStatusChange('sent')}
                      >
                        Mark as Sent
                      </Button>
                      <Button
                        variant="outline"
                        isLoading={actionLoading}
                        leftIcon={<Trash2 size={16} />}
                        onClick={handleDeleteDraft}
                      >
                        Delete Draft
                      </Button>
                    </>
                  )}

                  {status === 'sent' && (
                    <Button
                      variant="primary"
                      isLoading={actionLoading}
                      leftIcon={<CheckCircle2 size={16} />}
                      onClick={() => handleStatusChange('received')}
                    >
                      Mark as Received
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Line Items Table */}
          <Card>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Itemized Order Manifest ({po.items?.length || 0})
            </h3>

            <div className="table-responsive-container">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Order Qty</th>
                    <th>Unit Est. Cost</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(po.items || []).map((item, idx) => {
                    const cost = item.estimated_cost || 0;
                    const total = cost * item.quantity;
                    return (
                      <tr key={idx}>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.product_name}</strong>
                        </td>
                        <td>
                          <span className="font-mono">{item.quantity}</span>
                        </td>
                        <td>
                          <span className="font-mono">{cost ? `₹${cost.toFixed(2)}` : '—'}</span>
                        </td>
                        <td>
                          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {cost ? `₹${total.toFixed(2)}` : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Estimated Grand Total:</span>
              <span className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{(po.total_estimated_cost || 0).toFixed(2)}
              </span>
            </div>

            {po.notes && (
              <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>Notes:</strong> {po.notes}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetailPage;
