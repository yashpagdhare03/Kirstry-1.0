import React, { useState, useEffect } from 'react';
import { storeService } from '../../services/store';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import { Save, Lock, CheckCircle2 } from 'lucide-react';
import styles from './SettingsPages.module.css';

interface StoreProfileTabProps {
  isOwner: boolean;
}

export const StoreProfileTab: React.FC<StoreProfileTabProps> = ({ isOwner }) => {
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [phone, setPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStore = async () => {
    setLoading(true);
    try {
      const res = await storeService.getStoreDetails();
      if (res.success && res.data) {
        setName(res.data.name || '');
        setAddress(res.data.address || '');
        setGstin(res.data.gstin || '');
        setPhone(res.data.phone || '');
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    if (!name.trim()) {
      setError('Store name is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await storeService.updateStoreDetails({
        name: name.trim(),
        address: address.trim() || undefined,
        gstin: gstin.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (res.success && res.data) {
        setSuccessMsg('Store profile updated successfully!');
      } else {
        setError((res as any).message || 'Failed to update store details');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating store details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {!isOwner && (
        <Card style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3B82F6', fontSize: '13px' }}>
            <Lock size={18} />
            <span>
              <strong>Read-Only Mode:</strong> Only the Store Owner can modify store business registration details.
            </span>
          </div>
        </Card>
      )}

      {successMsg && (
        <Card style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--state-success)', fontSize: '13px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        </Card>
      )}

      {loading ? (
        <Skeleton height={340} />
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            {error && (
              <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <Input
              label="Store Business Name *"
              placeholder="e.g. Yash Kirana Store"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner}
              required
            />

            <Input
              label="Store Physical Address"
              placeholder="e.g. Shop 12, Main Market Road, Mumbai"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isOwner}
            />

            <Input
              label="GSTIN Identification Number"
              placeholder="e.g. 27AAACK1234F1Z5"
              isMono
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              disabled={!isOwner}
            />

            <Input
              label="Contact Phone / WhatsApp"
              placeholder="e.g. +91 98223 34455"
              isMono
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isOwner}
            />

            {isOwner && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                  leftIcon={<Save size={16} />}
                >
                  Save Store Profile
                </Button>
              </div>
            )}
          </form>
        </Card>
      )}
    </div>
  );
};

export default StoreProfileTab;
