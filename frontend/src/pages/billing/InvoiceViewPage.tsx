import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { billingService, type SaleRecord } from '../../services/billing';
import { Button, Card, Skeleton } from '../../components/shared';
import {
  Printer,
  Download,
  Share2,
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import styles from './BillingPages.module.css';

export const InvoiceViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { sale_id } = useParams<{ sale_id: string }>();

  const [sale, setSale] = useState<SaleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    async function loadSale() {
      if (!sale_id) return;
      setLoading(true);
      try {
        const [saleRes, waRes] = await Promise.all([
          billingService.getSale(sale_id),
          billingService.getWhatsappShareLink(sale_id),
        ]);

        if (saleRes.success && saleRes.data) {
          setSale(saleRes.data);
        }
        if (waRes.success && waRes.data?.whatsapp_url) {
          setWhatsappUrl(waRes.data.whatsapp_url);
        }
      } catch (err) {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    loadSale();
  }, [sale_id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!sale_id) return;
    setDownloadingPdf(true);
    try {
      if (sale?.invoice_url) {
        window.open(sale.invoice_url, '_blank');
      } else {
        const res = await billingService.generateInvoicePdf(sale_id);
        if (res.success && res.data?.invoice_url) {
          window.open(res.data.invoice_url, '_blank');
        }
      }
    } catch (err) {
      // Silently handle
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getPaymentBadge = (mode?: string) => {
    const pmode = (mode || 'cash').toLowerCase();
    switch (pmode) {
      case 'cash':
        return <span className={`${styles.paymentBadge} ${styles.paymentCash}`}>Paid Cash</span>;
      case 'upi':
        return <span className={`${styles.paymentBadge} ${styles.paymentUpi}`}>Paid UPI</span>;
      case 'credit':
        return <span className={`${styles.paymentBadge} ${styles.paymentCredit}`}>Khata Credit</span>;
      default:
        return <span className={styles.paymentBadge}>{pmode}</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Tax Invoice Receipt</h1>
          <p className={styles.subtitle}>Verified digital receipt & GST tax invoice summary</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/billing')}
          >
            Sales History
          </Button>
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={16} />}
            onClick={() => navigate('/billing/new')}
          >
            New Sale
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton height={400} />
      ) : !sale ? (
        <Card>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Sale invoice not found
          </div>
        </Card>
      ) : (
        <div className={styles.invoiceSheet}>
          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-default)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--state-success)', fontWeight: 600 }}>
              <CheckCircle2 size={20} />
              Invoice Completed
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer size={16} />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                isLoading={downloadingPdf}
                leftIcon={<Download size={16} />}
                onClick={handleDownloadPdf}
              >
                Download PDF
              </Button>
              {whatsappUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Share2 size={16} />}
                  onClick={() => window.open(whatsappUrl, '_blank')}
                >
                  Share WhatsApp
                </Button>
              )}
            </div>
          </div>

          {/* Invoice Header */}
          <div className={styles.invoiceHeader}>
            <div>
              <div className={styles.invoiceStoreTitle}>Kirstry Kirana Store</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Main Branch • Contact: +91 98765 43210
              </div>
            </div>

            <div className={styles.invoiceMeta}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {sale.invoice_number}
              </div>
              <div style={{ marginTop: '4px' }}>
                {new Date(sale.created_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div style={{ marginTop: '6px' }}>{getPaymentBadge(sale.payment_mode)}</div>
            </div>
          </div>

          {/* Customer Details */}
          {sale.customers && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-surface-alt)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
              }}
            >
              <strong>Billed To:</strong> {sale.customers.name}{' '}
              {sale.customers.phone ? `(${sale.customers.phone})` : ''}
            </div>
          )}

          {/* Line Items Table */}
          <table className={styles.invoiceTable}>
            <thead>
              <tr>
                <th>Product Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(sale.sale_items || []).map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.products?.name || 'Product Item'}</strong>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.unit_price.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₹{item.total_price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Totals */}
          <div className={styles.invoiceTotals}>
            <div>
              Subtotal: <strong>₹{sale.subtotal.toFixed(2)}</strong>
            </div>
            {sale.discount > 0 && (
              <div style={{ color: 'var(--state-success)' }}>
                Discount: <strong>-₹{sale.discount.toFixed(2)}</strong>
              </div>
            )}
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Total Paid: ₹{sale.total_amount.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceViewPage;
