import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryService } from '../../services/inventory';
import { type Product } from '../../services/products';
import { ProductSelector } from '../../components/inventory/ProductSelector';
import { Button, Card, Input } from '../../components/shared';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import styles from './InventoryPages.module.css';

export const StockInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledProductId = location.state?.product_id || '';

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number | string>('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [costPrice, setCostPrice] = useState<number | string>('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await inventoryService.recordStockIn({
        product_id: selectedProduct.product_id || (selectedProduct as any).id,
        quantity: Number(quantity),
        batch_number: batchNumber.trim() || undefined,
        expiry_date: expiryDate || undefined,
        purchase_date: purchaseDate || undefined,
        cost_price: costPrice ? Number(costPrice) : undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        navigate('/inventory');
      } else {
        setError((res as any).message || 'Failed to record stock-in');
      }
    } catch (err: any) {
      setError(err.message || 'Error recording stock-in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Record Stock In (Batch Purchase)</h1>
          <p className={styles.subtitle}>Add new inventory batch arriving from suppliers or wholesalers</p>
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
              onSelectProduct={(p) => setSelectedProduct(p)}
              required
            />
          </div>

          {/* Quantity */}
          <Input
            label="Quantity Added *"
            type="number"
            min="1"
            placeholder="e.g. 50"
            isMono
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          {/* Cost Price */}
          <Input
            label="Cost Price Per Unit (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            isMono
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
          />

          {/* Batch Number */}
          <Input
            label="Batch Number (Optional)"
            placeholder="e.g. BATCH-20260806-01"
            isMono
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />

          {/* Purchase Date */}
          <Input
            label="Purchase Date *"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />

          {/* Expiry Date */}
          <Input
            label="Expiry Date (Optional)"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          {/* Notes */}
          <div className={styles.fullRow}>
            <Input
              label="Notes / Supplier Details"
              placeholder="e.g. Received 2 cartons from Metro Cash & Carry"
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
              leftIcon={<PlusCircle size={16} />}
            >
              Record Stock In
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StockInPage;
