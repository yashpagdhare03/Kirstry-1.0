import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { khataService, type Customer } from '../../services/khata';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import {
  ArrowLeft,
  Phone,
  MapPin,
  ShieldAlert,
  PlusCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import styles from './KhataPages.module.css';

export const CustomerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer_id } = useParams<{ customer_id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form states
  const [creditAmount, setCreditAmount] = useState<number | string>('');
  const [dueDate, setDueDate] = useState('');
  const [creditNote, setCreditNote] = useState('');

  const [paymentAmount, setPaymentAmount] = useState<number | string>('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentNote, setPaymentNote] = useState('');

  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadCustomer = async () => {
    if (!customer_id) return;
    setLoading(true);
    try {
      const res = await khataService.getCustomer(customer_id);
      if (res.success && res.data) {
        setCustomer(res.data);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [customer_id]);

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer_id || !creditAmount || Number(creditAmount) <= 0) {
      setModalError('Amount must be greater than 0');
      return;
    }

    setModalSubmitting(true);
    setModalError(null);

    try {
      const res = await khataService.recordCredit({
        customer_id,
        amount: Number(creditAmount),
        due_date: dueDate || undefined,
        note: creditNote.trim() || undefined,
      });

      if (res.success) {
        setShowCreditModal(false);
        setCreditAmount('');
        setDueDate('');
        setCreditNote('');
        loadCustomer();
      } else {
        setModalError((res as any).message || 'Failed to record credit');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error recording credit');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer_id || !paymentAmount || Number(paymentAmount) <= 0) {
      setModalError('Amount must be greater than 0');
      return;
    }

    const outstanding = customer?.outstanding_balance || 0;
    const amountToPay = Number(paymentAmount);

    // MANDATORY Requirement: Validate client-side payment_amount <= outstanding_balance
    if (amountToPay > outstanding) {
      setModalError(
        `Payment amount (₹${amountToPay.toFixed(2)}) cannot exceed total outstanding balance (₹${outstanding.toFixed(2)}).`
      );
      return;
    }

    setModalSubmitting(true);
    setModalError(null);

    try {
      const res = await khataService.recordPayment({
        customer_id,
        amount: amountToPay,
        payment_mode: paymentMode,
        note: paymentNote.trim() || undefined,
      });

      if (res.success) {
        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentNote('');
        loadCustomer();
      } else {
        setModalError((res as any).message || 'Failed to record payment');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error recording payment');
    } finally {
      setModalSubmitting(false);
    }
  };

  const outstanding = customer?.outstanding_balance || 0;

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{customer ? customer.name : 'Customer Khata Ledger'}</h1>
          <p className={styles.subtitle}>Full udhari transaction history, pending dues, and payment collection receipts</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/khata')}
        >
          Back to Directory
        </Button>
      </div>

      {loading ? (
        <Skeleton height={400} />
      ) : !customer ? (
        <Card>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Customer profile not found
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Customer Profile & Balance Overview */}
          <Card>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{customer.name}</h2>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {customer.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} /> {customer.phone}
                      </span>
                    )}
                    {customer.address && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {customer.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Balance Badge */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Net Outstanding Balance</div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      color: outstanding > 0 ? 'var(--state-error)' : 'var(--state-success)',
                    }}
                  >
                    ₹{outstanding.toFixed(2)}
                  </div>
                  {customer.credit_limit && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Credit Limit: ₹{customer.credit_limit.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
                <Button
                  variant="secondary"
                  leftIcon={<PlusCircle size={16} />}
                  onClick={() => {
                    setModalError(null);
                    setShowCreditModal(true);
                  }}
                >
                  Give Credit (Udhari)
                </Button>
                <Button
                  variant="primary"
                  disabled={outstanding <= 0}
                  leftIcon={<CheckCircle size={16} />}
                  onClick={() => {
                    setModalError(null);
                    setPaymentAmount(outstanding);
                    setShowPaymentModal(true);
                  }}
                >
                  Collect Payment
                </Button>
              </div>
            </div>
          </Card>

          {/* Transaction Ledger Timeline */}
          <Card>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Ledger Timeline Log
            </h3>

            {!customer.transactions || customer.transactions.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No credit or payment transactions recorded for this customer yet.
              </div>
            ) : (
              <div className={styles.timelineContainer}>
                {customer.transactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  return (
                    <div key={tx.id} className={styles.timelineItem}>
                      <div
                        className={`${styles.timelineDot} ${
                          isCredit ? styles.timelineDotCredit : styles.timelineDotPayment
                        }`}
                      />

                      <div className={styles.timelineHeader}>
                        <div className={styles.timelineTitle}>
                          {isCredit ? (
                            <>
                              <ShieldAlert size={16} style={{ color: 'var(--state-error)' }} />
                              Credit Given (Udhari)
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} style={{ color: 'var(--state-success)' }} />
                              Payment Received
                            </>
                          )}
                        </div>

                        <div className={isCredit ? styles.timelineAmountCredit : styles.timelineAmountPayment}>
                          {isCredit ? `-₹${tx.amount.toFixed(2)}` : `+₹${tx.amount.toFixed(2)}`}
                        </div>
                      </div>

                      <div className={styles.timelineDate}>
                        {new Date(tx.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {tx.payment_mode ? ` • ${tx.payment_mode.toUpperCase()}` : ''}
                        {tx.due_date ? ` • Due: ${tx.due_date}` : ''}
                      </div>

                      {tx.note && <div className={styles.timelineNote}>{tx.note}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal: Give Credit */}
      {showCreditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalDialog}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Give Credit (Udhari)</div>
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCredit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {modalError && (
                <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>
                  {modalError}
                </div>
              )}

              <Input
                label="Credit Amount (₹) *"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 250.00"
                isMono
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                required
              />

              <Input
                label="Payment Due Date (Optional)"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <Input
                label="Notes / Items Taken"
                placeholder="e.g. 2 Milk packets + Rice 5kg"
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={modalSubmitting}
                  leftIcon={<PlusCircle size={16} />}
                >
                  Record Credit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalDialog}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Record Payment Collection</div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {modalError && (
                <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>
                  {modalError}
                </div>
              )}

              <Input
                label="Amount Collected (₹) *"
                type="number"
                min="1"
                max={outstanding || undefined}
                step="0.01"
                placeholder="e.g. 500.00"
                isMono
                value={paymentAmount}
                onChange={(e) => {
                  setPaymentAmount(e.target.value);
                  setModalError(null);
                }}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500 }}>Payment Mode *</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <option value="cash">Cash Collection</option>
                  <option value="upi">UPI / GPay / PhonePe</option>
                </select>
              </div>

              <Input
                label="Notes"
                placeholder="e.g. Partial repayment via GPay"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={modalSubmitting}
                  leftIcon={<CheckCircle size={16} />}
                >
                  Collect Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailPage;
