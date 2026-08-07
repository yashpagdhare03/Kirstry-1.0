import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingService, type SaleRecord } from '../../services/billing';
import { Button, Card, Skeleton } from '../../components/shared';
import { PlusCircle, FileText, Calendar, Eye } from 'lucide-react';
import styles from './BillingPages.module.css';

export const SalesHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await billingService.getSales({
        payment_mode: paymentModeFilter === 'all' ? undefined : paymentModeFilter,
      });
      if (res.success && res.data) {
        setSales(res.data.sales || []);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [paymentModeFilter]);

  const getPaymentBadge = (mode?: string) => {
    const pmode = (mode || 'cash').toLowerCase();
    switch (pmode) {
      case 'cash':
        return <span className={`${styles.paymentBadge} ${styles.paymentCash}`}>Cash</span>;
      case 'upi':
        return <span className={`${styles.paymentBadge} ${styles.paymentUpi}`}>UPI</span>;
      case 'credit':
        return <span className={`${styles.paymentBadge} ${styles.paymentCredit}`}>Khata</span>;
      default:
        return <span className={styles.paymentBadge}>{pmode}</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>POS Sales History</h1>
          <p className={styles.subtitle}>Historical counter sales transactions, invoices, and payment records</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            leftIcon={<Calendar size={16} />}
            onClick={() => navigate('/billing/summary')}
          >
            End-of-Day Summary
          </Button>
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={16} />}
            onClick={() => navigate('/billing/new')}
          >
            New POS Sale
          </Button>
        </div>
      </div>

      {/* Payment Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setPaymentModeFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: paymentModeFilter === 'all' ? 'var(--accent-primary)' : 'var(--bg-surface-alt)',
            color: paymentModeFilter === 'all' ? 'var(--bg-base)' : 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            cursor: 'pointer',
          }}
        >
          All Sales
        </button>
        <button
          onClick={() => setPaymentModeFilter('cash')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: paymentModeFilter === 'cash' ? 'var(--accent-primary)' : 'var(--bg-surface-alt)',
            color: paymentModeFilter === 'cash' ? 'var(--bg-base)' : 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            cursor: 'pointer',
          }}
        >
          Cash Payments
        </button>
        <button
          onClick={() => setPaymentModeFilter('upi')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: paymentModeFilter === 'upi' ? 'var(--accent-primary)' : 'var(--bg-surface-alt)',
            color: paymentModeFilter === 'upi' ? 'var(--bg-base)' : 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            cursor: 'pointer',
          }}
        >
          UPI / QR
        </button>
        <button
          onClick={() => setPaymentModeFilter('credit')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: paymentModeFilter === 'credit' ? 'var(--accent-primary)' : 'var(--bg-surface-alt)',
            color: paymentModeFilter === 'credit' ? 'var(--bg-base)' : 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            cursor: 'pointer',
          }}
        >
          Credit (Khata)
        </button>
      </div>

      {/* Sales Table Card */}
      <Card>
        {loading ? (
          <Skeleton height={300} />
        ) : sales.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              No sales transactions found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Create a new bill to start recording counter sales.
            </p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className={styles.invoiceTable}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Payment Mode</th>
                  <th>Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {s.invoice_number}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(s.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        {s.customers?.name || 'Walk-in Customer'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono">{s.items_count}</span>
                    </td>
                    <td>{getPaymentBadge(s.payment_mode)}</td>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                        ₹{s.total_amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye size={14} />}
                        onClick={() => navigate(`/billing/invoice/${s.id}`)}
                      >
                        View Invoice
                      </Button>
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

export default SalesHistoryPage;
