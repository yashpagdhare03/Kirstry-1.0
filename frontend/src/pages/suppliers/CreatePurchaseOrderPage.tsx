import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supplierService, type Supplier, type POItem } from '../../services/supplier';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import { ArrowLeft, Plus, Trash2, ShoppingBag } from 'lucide-react';
import styles from './SupplierPages.module.css';

export const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  // Items list
  const [items, setItems] = useState<POItem[]>([
    { product_name: '', quantity: 10, estimated_cost: 0 },
  ]);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSupplier() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await supplierService.getSupplier(id);
        if (res.success && res.data) {
          setSupplier(res.data);
        }
      } catch (err) {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    loadSupplier();
  }, [id]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { product_name: '', quantity: 10, estimated_cost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof POItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const totalEstimatedCost = items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.estimated_cost || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Validate items
    const validItems = items.filter((item) => item.product_name.trim().length > 0 && item.quantity > 0);
    if (validItems.length === 0) {
      setError('Please add at least 1 valid item with a product name and quantity');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await supplierService.createPurchaseOrder({
        supplier_id: id,
        items: validItems.map((item) => ({
          product_name: item.product_name.trim(),
          quantity: Number(item.quantity),
          estimated_cost: item.estimated_cost ? Number(item.estimated_cost) : undefined,
        })),
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        const poid = res.data.po_id || res.data.id;
        navigate(`/purchase-orders/${poid}`);
      } else {
        setError((res as any).message || 'Failed to create purchase order');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            {supplier ? `New Purchase Order — ${supplier.name}` : 'New Purchase Order Wizard'}
          </h1>
          <p className={styles.subtitle}>Build items order manifest for vendor fulfillment</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(id ? `/suppliers/${id}` : '/suppliers')}
        >
          Cancel
        </Button>
      </div>

      {loading ? (
        <Skeleton height={360} />
      ) : !supplier ? (
        <Card>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Supplier profile not found
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>
                {error}
              </div>
            )}

            {/* Dynamic Items Builder */}
            <div className={styles.poItemContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Order Line Items ({items.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={handleAddItem}
                >
                  Add Line Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className={styles.poItemRow}>
                  <Input
                    label={`Item #${index + 1} Name *`}
                    placeholder="e.g. Maggi 2-Min Noodles 280g"
                    value={item.product_name}
                    onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                    required
                  />

                  <Input
                    label="Order Qty *"
                    type="number"
                    min="1"
                    placeholder="10"
                    isMono
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    required
                  />

                  <Input
                    label="Unit Est. Cost (₹)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    isMono
                    value={item.estimated_cost || ''}
                    onChange={(e) => handleItemChange(index, 'estimated_cost', Number(e.target.value))}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: items.length <= 1 ? 'var(--text-muted)' : 'var(--state-error)',
                        cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                        padding: '8px',
                      }}
                      title="Remove Item Row"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Financial Estimate Summary */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                backgroundColor: 'var(--bg-surface-alt)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
              }}
            >
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Estimated Order Subtotal:</span>
              <span className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{totalEstimatedCost.toFixed(2)}
              </span>
            </div>

            {/* Notes */}
            <Input
              label="Order Notes / Dispatch Instructions"
              placeholder="e.g. Please deliver by Thursday 10:00 AM"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/suppliers/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
                leftIcon={<ShoppingBag size={16} />}
              >
                Create Purchase Order (Draft)
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default CreatePurchaseOrderPage;
