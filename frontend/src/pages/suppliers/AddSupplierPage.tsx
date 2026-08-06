import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supplierService } from '../../services/supplier';
import { Button, Card, Input } from '../../components/shared';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import styles from './SupplierPages.module.css';

export const AddSupplierPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [itemsSupplied, setItemsSupplied] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Supplier name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await supplierService.createSupplier({
        name: name.trim(),
        phone: phone.trim() || undefined,
        items_supplied: itemsSupplied.trim() || undefined,
      });

      if (res.success && res.data) {
        const sid = res.data.supplier_id || (res.data as any).id;
        navigate(`/suppliers/${sid}`);
      } else {
        setError((res as any).message || 'Failed to create supplier');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating supplier profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container} style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Add Wholesale Supplier</h1>
          <p className={styles.subtitle}>Register new vendor details for purchase order creation</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/suppliers')}
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
            label="Supplier / Distributor Name *"
            placeholder="e.g. Metro Cash & Carry Wholesalers"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Contact Phone Number"
            placeholder="e.g. +91 98765 43210"
            isMono
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Items / Brands Supplied"
            placeholder="e.g. Dairy, Spices, Pulses, Biscuits"
            value={itemsSupplied}
            onChange={(e) => setItemsSupplied(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/suppliers')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              leftIcon={<PlusCircle size={16} />}
            >
              Register Supplier
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddSupplierPage;
