import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { khataService, type Customer, type KhataSummary } from '../../services/khata';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import {
  Users,
  UserPlus,
  BookOpen,
  Phone,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import styles from './KhataPages.module.css';

export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<KhataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [custRes, sumRes] = await Promise.all([
        khataService.getCustomers({ search: search || undefined }),
        khataService.getKhataSummary(),
      ]);

      if (custRes.success && custRes.data) {
        setCustomers(custRes.data.customers || []);
      }
      if (sumRes.success && sumRes.data) {
        setSummary(sumRes.data);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Digital Khata (Customer Credit)</h1>
          <p className={styles.subtitle}>Manage customer credit balances, payment receipts, and udhari accounts</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            leftIcon={<AlertCircle size={16} />}
            onClick={() => navigate('/khata/outstanding')}
          >
            Outstanding Report
          </Button>
          <Button
            variant="primary"
            leftIcon={<UserPlus size={16} />}
            onClick={() => navigate('/khata/add')}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <Card style={{ borderLeft: '4px solid var(--state-error)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingDown size={28} style={{ color: 'var(--state-error)' }} />
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Outstanding Exposure</div>
                <div className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹{(summary.total_outstanding || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ borderLeft: '4px solid #3B82F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={28} style={{ color: '#3B82F6' }} />
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customers with Pending Credit</div>
                <div className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {summary.total_customers_with_credit || 0}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search Filter */}
      <div style={{ maxWidth: '360px' }}>
        <Input
          placeholder="Search customer by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer Directory */}
      {loading ? (
        <Skeleton height={300} />
      ) : customers.length === 0 ? (
        <Card>
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              No customers registered in Khata
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Click 'Add Customer' to create a customer credit account.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Customer Cards Grid (Mobile View) */}
          <div className={styles.customerGrid}>
            {customers.map((c) => {
              const cid = c.customer_id || (c as any).id;
              const hasBalance = c.outstanding_balance > 0;
              return (
                <div
                  key={cid}
                  className={styles.customerCard}
                  onClick={() => navigate(`/khata/${cid}`)}
                >
                  <div>
                    <div className={styles.customerName}>{c.name}</div>
                    <div className={styles.customerMeta}>
                      <Phone size={12} />
                      {c.phone || 'No phone provided'}
                    </div>
                  </div>

                  <div className={styles.balanceRow}>
                    <span className={styles.balanceLabel}>Net Outstanding:</span>
                    <span
                      className={`font-mono ${styles.balanceBadge} ${
                        hasBalance ? styles.balancePositive : styles.balanceZero
                      }`}
                    >
                      ₹{c.outstanding_balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerListPage;
