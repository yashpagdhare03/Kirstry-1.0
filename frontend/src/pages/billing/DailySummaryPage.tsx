import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingService, type DailySummary } from '../../services/billing';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import {
  ArrowLeft,
  Banknote,
  QrCode,
  CreditCard,
  PlusCircle,
  TrendingUp,
  ShoppingBag,
  Receipt,
} from 'lucide-react';
import styles from './BillingPages.module.css';

export const DailySummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      try {
        const res = await billingService.getDailySummary(targetDate);
        if (res.success && res.data) {
          setSummary(res.data);
        }
      } catch (err) {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [targetDate]);

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>End-of-Day Sales Summary</h1>
          <p className={styles.subtitle}>Daily sales revenue, order velocity, and payment mode reconciliation breakdown</p>
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

      {/* Date Selector */}
      <div style={{ maxWidth: '240px' }}>
        <Input
          label="Target Date *"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />
      </div>

      {loading ? (
        <Skeleton height={280} />
      ) : !summary ? (
        <Card>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No sales data recorded for target date
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top KPI Metrics Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <Card style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp size={28} style={{ color: 'var(--accent-primary)' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Revenue</div>
                  <div className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{(summary.total_revenue || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>

            <Card style={{ borderLeft: '4px solid #3B82F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Receipt size={28} style={{ color: '#3B82F6' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Sales Invoices</div>
                  <div className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {summary.total_sales_count || 0}
                  </div>
                </div>
              </div>
            </Card>

            <Card style={{ borderLeft: '4px solid var(--state-success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingBag size={28} style={{ color: 'var(--state-success)' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Items Sold</div>
                  <div className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {summary.total_items_sold || 0}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Mode Revenue Breakdown */}
          <Card>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Payment Mode Revenue Breakdown
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Banknote size={24} style={{ color: 'var(--state-success)' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cash Revenue</div>
                  <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{(summary.payment_mode_breakdown?.cash || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <QrCode size={24} style={{ color: '#3B82F6' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>UPI / QR Revenue</div>
                  <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{(summary.payment_mode_breakdown?.upi || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <CreditCard size={24} style={{ color: 'var(--state-warning)' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Khata Credit Revenue</div>
                  <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{(summary.payment_mode_breakdown?.credit || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DailySummaryPage;
