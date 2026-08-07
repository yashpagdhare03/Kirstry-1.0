import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryService, type StockBatch } from '../../services/inventory';
import { type Product } from '../../services/products';
import { ProductSelector } from '../../components/inventory/ProductSelector';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import { ArrowLeft, Sliders } from 'lucide-react';
import styles from './InventoryPages.module.css';

export const AdjustmentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledProductId = location.state?.product_id || '';
  const prefilledBatchId = location.state?.batch_id || '';

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState(prefilledBatchId);
  const [newQuantity, setNewQuantity] = useState<number | string>('');
  const [notes, setNotes] = useState('');

  const [loadingBatches, setLoadingBatches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load batches whenever selectedProduct changes
  useEffect(() => {
    async function loadBatches() {
      if (!selectedProduct) {
        setBatches([]);
        setSelectedBatchId('');
        return;
      }
      setLoadingBatches(true);
      try {
        const pid = selectedProduct.product_id || (selectedProduct as any).id;
        const res = await inventoryService.getBatches(pid);
        if (res.success && Array.isArray(res.data)) {
          setBatches(res.data);
          if (prefilledBatchId && res.data.some((b) => b.id === prefilledBatchId)) {
            setSelectedBatchId(prefilledBatchId);
          } else if (res.data.length > 0) {
            setSelectedBatchId(res.data[0].id);
          }
        }
      } catch (err) {
        // Silently handle
      } finally {
        setLoadingBatches(false);
      }
    }
    loadBatches();
  }, [selectedProduct]);

  const activeBatch = batches.find((b) => b.id === selectedBatchId);
  const currentQuantity = activeBatch ? activeBatch.quantity_remaining : 0;
  const qtyDiff = newQuantity !== '' ? Number(newQuantity) - currentQuantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedBatchId) {
      setError('Please select a product and batch');
      return;
    }
    if (newQuantity === '' || Number(newQuantity) < 0) {
      setError('New physical count must be a non-negative number');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await inventoryService.recordAdjustment({
        product_id: selectedProduct.product_id || (selectedProduct as any).id,
        batch_id: selectedBatchId,
        new_quantity: Number(newQuantity),
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        navigate('/inventory');
      } else {
        setError((res as any).message || 'Failed to record stock adjustment');
      }
    } catch (err: any) {
      setError(err.message || 'Error recording stock adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Physical Count Reconciliation</h1>
          <p className={styles.subtitle}>Reconcile physical inventory counts with system balances for audit compliance</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/inventory')}
        >
          Back to Stock Levels
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {error && (
            <div className={styles.fullRow} style={{ color: 'var(--state-error)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Product Autocomplete Selector */}
          <div className={styles.fullRow}>
            <ProductSelector
              selectedProductId={prefilledProductId}
              onSelectProduct={(p) => {
                setSelectedProduct(p);
                setError(null);
              }}
              required
            />
          </div>

          {/* Batch Selector */}
          <div className="container" style={{ gap: '6px' }}>
            <label className="label" style={{ fontSize: '13px', fontWeight: 500 }}>
              Target Stock Batch *
            </label>
            {loadingBatches ? (
              <Skeleton height={40} />
            ) : (
              <select
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  const b = batches.find((x) => x.id === e.target.value);
                  if (b) setNewQuantity(b.quantity_remaining);
                }}
                disabled={!selectedProduct || batches.length === 0}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
                required
              >
                {batches.length === 0 ? (
                  <option value="">
                    {selectedProduct ? 'No active batches available for this product' : 'Select product first'}
                  </option>
                ) : (
                  batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batch_number} • Qty Remaining: {b.quantity_remaining}{' '}
                      {b.expiry_date ? `• Exp: ${b.expiry_date}` : ''}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* New Physical Count */}
          <Input
            label="New Actual Physical Count *"
            type="number"
            min="0"
            placeholder="0"
            isMono
            value={newQuantity}
            onChange={(e) => {
              setNewQuantity(e.target.value);
              setError(null);
            }}
            required
          />

          {/* Quantity Difference Preview */}
          {activeBatch && newQuantity !== '' && (
            <div className={styles.fullRow}>
              <div className={styles.adjustmentPreviewCard}>
                <div>
                  System Recorded: <strong>{currentQuantity}</strong> → Actual Physical:{' '}
                  <strong>{newQuantity}</strong>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '14px',
                    color: qtyDiff < 0 ? 'var(--state-error)' : qtyDiff > 0 ? 'var(--state-success)' : 'var(--text-muted)',
                  }}
                >
                  Adjustment: {qtyDiff > 0 ? `+${qtyDiff}` : qtyDiff} units
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className={styles.fullRow}>
            <Input
              label="Reconciliation Reason / Notes"
              placeholder="e.g. End of month physical inventory count audit"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className={`${styles.fullRow} ${styles.formActions}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/inventory')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              leftIcon={<Sliders size={16} />}
            >
              Reconcile Inventory
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdjustmentPage;
