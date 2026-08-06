import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryService } from '../../services/inventory';
import { type Product } from '../../services/products';
import { ProductSelector } from '../../components/inventory/ProductSelector';
import { Button, Card, Input } from '../../components/shared';
import { ArrowLeft, MinusCircle, AlertTriangle } from 'lucide-react';
import styles from './InventoryPages.module.css';

export const StockOutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledProductId = location.state?.product_id || '';

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number | string>('');
  const [reason, setReason] = useState('damage');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableStock = selectedProduct
    ? selectedProduct.total_stock ?? (selectedProduct as any).current_stock ?? 0
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    // MANDATORY Requirement: Validate client-side requested_quantity <= available_quantity
    if (qty > availableStock) {
      setError(
        `Cannot remove ${qty} ${selectedProduct.unit}. Total available stock is only ${availableStock} ${selectedProduct.unit}.`
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await inventoryService.recordStockOut({
        product_id: selectedProduct.product_id || (selectedProduct as any).id,
        quantity: qty,
        reason,
        reference_id: referenceId.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        navigate('/inventory');
      } else {
        setError((res as any).message || 'Failed to record stock-out');
      }
    } catch (err: any) {
      setError(err.message || 'Error recording stock-out');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Record Stock Out (Deduction)</h1>
          <p className={styles.subtitle}>Remove stock due to damage, spoilage, customer returns, or manual corrections</p>
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

          {/* Available Stock Indicator */}
          {selectedProduct && (
            <div className={styles.fullRow}>
              <div className={styles.availableStockAlert}>
                <AlertTriangle size={16} style={{ color: '#3B82F6' }} />
                <span>
                  Available Stock for <strong>{selectedProduct.name}</strong>:{' '}
                  <strong className="font-mono">{availableStock} {selectedProduct.unit}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Quantity */}
          <Input
            label="Quantity to Remove *"
            type="number"
            min="1"
            max={availableStock || undefined}
            placeholder="e.g. 2"
            isMono
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError(null);
            }}
            required
          />

          {/* Reason Select */}
          <div className="container" style={{ gap: '6px' }}>
            <label className="label" style={{ fontSize: '13px', fontWeight: 500 }}>
              Reason for Removal *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
            >
              <option value="damage">Damaged / Expired Item</option>
              <option value="spoilage">Spoilage / Leakage</option>
              <option value="return">Customer Return to Supplier</option>
              <option value="sale">Manual Sale Deduction</option>
              <option value="other">Other Reason</option>
            </select>
          </div>

          {/* Reference ID */}
          <Input
            label="Reference ID (Optional)"
            placeholder="e.g. REF-INVOICE-99"
            isMono
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
          />

          {/* Notes */}
          <div className={styles.fullRow}>
            <Input
              label="Notes"
              placeholder="e.g. Broken seal during transit"
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
              variant="secondary"
              isLoading={submitting}
              leftIcon={<MinusCircle size={16} />}
            >
              Deduct Stock
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StockOutPage;
