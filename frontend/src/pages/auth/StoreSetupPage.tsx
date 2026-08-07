import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/shared';
import { Store, ArrowRight } from 'lucide-react';
import styles from './AuthPages.module.css';

export const StoreSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setupStore } = useAuth();

  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setError('Store Business Name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const ok = await setupStore({
        store_name: storeName.trim(),
        address: address.trim() || undefined,
        gstin: gstin.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (ok) {
        navigate('/');
      } else {
        setError('Failed to setup store profile');
      }
    } catch (err: any) {
      setError(err.message || 'Error setting up store profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        {/* Brand Logo Header */}
        <div className={styles.logoHeader}>
          <div className={styles.logoBadge}>
            <Store size={28} />
          </div>
          <h1 className={styles.authTitle}>Store Onboarding Wizard</h1>
          <p className={styles.authSubtitle}>Set up your store details to start POS billing & inventory</p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {error && (
            <div style={{ color: 'var(--state-error)', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <Input
            label="Store Business Name *"
            placeholder="e.g. Yash Kirana & General Store"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />

          <Input
            label="Store Physical Address"
            placeholder="e.g. Shop 12, Main Market, Mumbai"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="GSTIN Identification Number (Optional)"
            placeholder="e.g. 27AAACK1234F1Z5"
            isMono
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
          />

          <Input
            label="Contact Phone / WhatsApp"
            placeholder="e.g. +91 98223 34455"
            isMono
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            rightIcon={<ArrowRight size={16} />}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Complete Setup & Open Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StoreSetupPage;
