import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { khataService, type Customer } from '../../services/khata';
import { Button, Card, Skeleton } from '../../components/shared';
import { ArrowLeft, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import styles from './KhataPages.module.css';

export const OutstandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOutstanding() {
      setLoading(true);
      try {
        const res = await khataService.getOutstandingCustomers();
        if (res.success && res.data) {
          setCustomers(res.data.customers || []);
        }
      } catch (err) {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    loadOutstanding();
  }, []);

  const totalOutstanding = customers.reduce((acc, c) => acc + (c.outstanding_balance || 0), 0);

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Outstanding Balances Report</h1>
          <p className={styles.subtitle}>Prioritized list of all customers with active credit balances requiring collection</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/khata')}
        >
          Back to Directory
        </Button>
      </div>

      {/* KPI Total Balance Header Card */}
      <Card style={{ borderLeft: '4px solid var(--state-error)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Store Outstanding Dues</div>
            <div className="font-mono" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--state-error)' }}>
              ₹{totalOutstanding.toFixed(2)}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <strong>{customers.length}</strong> Pending Accounts
          </div>
        </div>
      </Card>

      {/* Outstanding Customers Table */}
      <Card>
        {loading ? (
          <Skeleton height={300} />
        ) : customers.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <AlertCircle size={48} style={{ color: 'var(--state-success)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              All Customer Accounts Cleared!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              No outstanding credit balances pending collection.
            </p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Credit Limit</th>
                  <th>Outstanding Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const cid = c.customer_id || (c as any).id;
                  return (
                    <tr key={cid}>
                      <td>
                        <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{c.name}</strong>
                      </td>
                      <td>
                        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                          {c.phone || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                          {c.credit_limit ? `₹${c.credit_limit.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      <td>
                        <span
                          className="font-mono"
                          style={{ fontWeight: 800, fontSize: '16px', color: 'var(--state-error)' }}
                        >
                          ₹{c.outstanding_balance.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle size={14} />}
                            onClick={() => navigate(`/khata/${cid}`)}
                          >
                            Collect
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye size={14} />}
                            onClick={() => navigate(`/khata/${cid}`)}
                          >
                            Ledger
                          </Button>
                        </div>
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

export default OutstandingPage;
