import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryService, type StockBatch } from '../../services/inventory';
import { productService, type Product } from '../../services/products';
import { Button, Card, Skeleton } from '../../components/shared';
import { ArrowLeft, Layers, Sliders, Calendar, AlertTriangle, PlusCircle } from 'lucide-react';
import styles from './InventoryPages.module.css';

export const BatchDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { product_id } = useParams<{ product_id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!product_id) return;
      setLoading(true);
      try {
        const [prodRes, batchRes] = await Promise.all([
          productService.getProduct(product_id),
          inventoryService.getBatches(product_id),
        ]);

        if (prodRes.success && prodRes.data) {
          setProduct(prodRes.data);
        }
        if (batchRes.success && Array.isArray(batchRes.data)) {
          setBatches(batchRes.data);
        }
      } catch (err) {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [product_id]);

  const getExpiryBadge = (expiryDateStr?: string) => {
    if (!expiryDateStr) {
      return <span className={`${styles.expiryBadge} ${styles.expiryFresh}`}>No Expiry Set</span>;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expiryDateStr);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className={`${styles.expiryBadge} ${styles.expiryExpired}`}>
          <AlertTriangle size={12} /> Expired ({Math.abs(diffDays)}d ago)
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className={`${styles.expiryBadge} ${styles.expiryWarning}`}>
          <Calendar size={12} /> Expiring in {diffDays} days
        </span>
      );
    } else {
      return (
        <span className={`${styles.expiryBadge} ${styles.expiryFresh}`}>
          Valid ({diffDays} days left)
        </span>
      );
    }
  };

  const totalStock = product ? (product.total_stock ?? (product as any).current_stock ?? 0) : 0;

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            {product ? `${product.name} — Batch Breakdown` : 'Batch Breakdown'}
          </h1>
          <p className={styles.subtitle}>
            {product
              ? `${product.brand ? `${product.brand} • ` : ''}Total Stock: ${totalStock} ${product.unit}`
              : 'Detailed stock batches and expiry dates'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/inventory')}
          >
            Back to Stock Levels
          </Button>
          {product_id && (
            <Button
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/inventory/stock-in', { state: { product_id } })}
            >
              Add Batch (Stock In)
            </Button>
          )}
        </div>
      </div>

      {/* Batches Table Card */}
      <Card>
        {loading ? (
          <Skeleton height={300} />
        ) : batches.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Layers size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              No active stock batches found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Add a purchase batch using Stock In to track batch numbers and expiration dates.
            </p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Batch #</th>
                  <th>Purchase Date</th>
                  <th>Cost Price</th>
                  <th>Initial / Remaining Qty</th>
                  <th>Expiry Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {b.batch_number}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {b.purchase_date || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                        {b.cost_price ? `₹${b.cost_price.toFixed(2)}` : '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="font-mono" style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {b.quantity_remaining}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          / {b.initial_quantity} {product?.unit || 'pcs'}
                        </span>
                      </div>
                    </td>
                    <td>{getExpiryBadge(b.expiry_date)}</td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Sliders size={14} />}
                        onClick={() =>
                          navigate('/inventory/adjustment', {
                            state: { product_id: b.product_id, batch_id: b.id },
                          })
                        }
                      >
                        Reconcile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BatchDetailPage;
