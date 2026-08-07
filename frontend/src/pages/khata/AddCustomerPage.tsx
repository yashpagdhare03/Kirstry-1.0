import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { khataService } from '../../services/khata';
import { Button, Card, Input } from '../../components/shared';
import { ArrowLeft, UserPlus } from 'lucide-react';
import styles from './KhataPages.module.css';

export const AddCustomerPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState<number | string>(5000);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await khataService.createCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        credit_limit: creditLimit ? Number(creditLimit) : undefined,
      });

      if (res.success && res.data) {
        const cid = res.data.customer_id || (res.data as any).id;
        navigate(`/khata/${cid}`);
      } else {
        setError((res as any).message || 'Failed to create customer');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating customer profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container} style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Add New Khata Customer</h1>
          <p className={styles.subtitle}>Register customer details for credit tracking and payment history</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/khata')}
        >
          Back to Directory
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <Input
            label="Customer Full Name *"
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Mobile Phone Number"
            placeholder="e.g. +91 98765 43210"
            isMono
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Address / Area Location"
            placeholder="e.g. Flat 302, Green Valley Apts"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Maximum Allowed Credit Limit (₹)"
            type="number"
            placeholder="5000"
            isMono
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/khata')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              leftIcon={<UserPlus size={16} />}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddCustomerPage;
