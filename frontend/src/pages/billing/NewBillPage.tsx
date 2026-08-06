import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { productService, type Product, type Category } from '../../services/products';
import { billingService } from '../../services/billing';
import { api } from '../../services/api';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Banknote,
  QrCode,
  CreditCard,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import styles from './BillingPages.module.css';

export interface CustomerOption {
  customer_id: string;
  name: string;
  phone?: string;
}

export const NewBillPage: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products, categories, and customers
  useEffect(() => {
    async function loadData() {
      setLoadingProducts(true);
      try {
        const [prodRes, catRes, custRes] = await Promise.all([
          productService.getProducts({ search: search || undefined, is_active: true }),
          productService.getCategories(),
          api.get<CustomerOption[]>('/customers'),
        ]);

        if (prodRes.success && Array.isArray(prodRes.data)) {
          setProducts(prodRes.data);
        }
        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
        if (custRes.success && Array.isArray(custRes.data)) {
          setCustomers(custRes.data);
        }
      } catch (err) {
        // Silently handle
      } finally {
        setLoadingProducts(false);
      }
    }
    loadData();
  }, [search]);

  // Filter products by selected category
  const filteredProducts = products.filter((p) => {
    if (selectedCategoryId !== 'all' && p.category_id !== selectedCategoryId) {
      return false;
    }
    return true;
  });

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      setError('Cart is empty. Please add items to create a bill.');
      return;
    }

    if (cart.paymentMode === 'credit' && !cart.selectedCustomerId) {
      setError('Customer selection is required for credit payment mode');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payloadItems = cart.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const res = await billingService.createBill({
        items: payloadItems,
        payment_mode: cart.paymentMode,
        customer_id: cart.selectedCustomerId || undefined,
        discount: cart.discount,
        notes: cart.notes || undefined,
      });

      if (res.success && res.data?.id) {
        cart.clearCart();
        navigate(`/billing/invoice/${res.data.id}`);
      } else {
        setError((res as any).message || 'Failed to create bill');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating POS bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>POS Billing Terminal</h1>
          <p className={styles.subtitle}>Fast counter sales billing, instant cart checkout, and digital receipts</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/billing')}
          >
            Sales History
          </Button>
        </div>
      </div>

      {/* POS Terminal 60/40 Split Screen Layout */}
      <div className={styles.posLayout}>
        {/* Left Column: Product Search & Catalog */}
        <div className={styles.catalogSection}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                placeholder="Search products by name, brand, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Category Filter Chips */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button
                  className={`button ${selectedCategoryId === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryId('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    backgroundColor: selectedCategoryId === 'all' ? 'var(--accent-primary)' : 'var(--bg-surface-alt)',
                    color: selectedCategoryId === 'all' ? 'var(--bg-base)' : 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                  }}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.category_id}
                    onClick={() => setSelectedCategoryId(cat.category_id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      backgroundColor: selectedCategoryId === cat.category_id ? 'var(--accent-primary)' : 'var(--bg-surface-alt)',
                      color: selectedCategoryId === cat.category_id ? 'var(--bg-base)' : 'var(--text-primary)',
                      border: '1px solid var(--border-default)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Product Grid */}
          {loadingProducts ? (
            <Skeleton height={260} />
          ) : filteredProducts.length === 0 ? (
            <Card>
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active products match search criteria
              </div>
            </Card>
          ) : (
            <div className={styles.productSearchGrid}>
              {filteredProducts.map((p) => {
                const availStock = p.total_stock ?? (p as any).current_stock ?? 0;
                const isOutOfStock = availStock <= 0;
                return (
                  <div
                    key={p.product_id || (p as any).id}
                    className={styles.posProductCard}
                    onClick={() => !isOutOfStock && cart.addItem(p)}
                    style={{ opacity: isOutOfStock ? 0.5 : 1 }}
                  >
                    <div>
                      <div className={styles.posProductTitle}>{p.name}</div>
                      <div className={styles.posProductMeta}>
                        {p.brand ? `${p.brand} • ` : ''}Stock: {availStock} {p.unit}
                      </div>
                    </div>
                    <div className={styles.posProductPriceRow}>
                      <span className={styles.posProductPrice}>₹{(p.selling_price || 0).toFixed(2)}</span>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) cart.addItem(p);
                        }}
                      >
                        + Add
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Cart & Checkout */}
        <div className={styles.cartSection}>
          <div className={styles.cartHeader}>
            <div className={styles.cartTitle}>
              <ShoppingCart size={20} />
              Current Bill ({cart.totalItemCount} items)
            </div>
            {cart.items.length > 0 && (
              <Button variant="outline" size="sm" onClick={cart.clearCart}>
                Clear
              </Button>
            )}
          </div>

          {error && (
            <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Cart Item List */}
          {cart.items.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Cart is empty. Click any product from the catalog to add.
            </div>
          ) : (
            <div className={styles.cartList}>
              {cart.items.map((item) => (
                <div key={item.product_id} className={styles.cartItemRow}>
                  <div className={styles.cartItemInfo}>
                    <div className={styles.cartItemName}>{item.name}</div>
                    <div className={styles.cartItemPrice}>
                      ₹{item.unit_price.toFixed(2)} / {item.unit}
                    </div>
                  </div>

                  <div className={styles.qtyControls}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => cart.updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => cart.updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '14px', width: '70px', textAlign: 'right' }}>
                    ₹{(item.quantity * item.unit_price).toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => cart.removeItem(item.product_id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Payment Mode Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Payment Mode *
            </label>
            <div className={styles.paymentModeSelector}>
              <button
                type="button"
                className={`${styles.paymentModeBtn} ${cart.paymentMode === 'cash' ? styles.paymentModeBtnActive : ''}`}
                onClick={() => cart.setPaymentMode('cash')}
              >
                <Banknote size={20} />
                CASH
              </button>
              <button
                type="button"
                className={`${styles.paymentModeBtn} ${cart.paymentMode === 'upi' ? styles.paymentModeBtnActive : ''}`}
                onClick={() => cart.setPaymentMode('upi')}
              >
                <QrCode size={20} />
                UPI / QR
              </button>
              <button
                type="button"
                className={`${styles.paymentModeBtn} ${cart.paymentMode === 'credit' ? styles.paymentModeBtnActive : ''}`}
                onClick={() => cart.setPaymentMode('credit')}
              >
                <CreditCard size={20} />
                CREDIT
              </button>
            </div>
          </div>

          {/* Customer Selector (Required if Payment Mode == 'credit') */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>
              Customer {cart.paymentMode === 'credit' ? '*' : '(Optional)'}
            </label>
            <select
              value={cart.selectedCustomerId}
              onChange={(e) => cart.setSelectedCustomerId(e.target.value)}
              required={cart.paymentMode === 'credit'}
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
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Financial Summary */}
          <div className={styles.financialSummary}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span className="font-mono">₹{cart.subtotal.toFixed(2)}</span>
            </div>

            <div className={styles.summaryRow} style={{ alignItems: 'center' }}>
              <span>Discount (₹)</span>
              <input
                type="number"
                min="0"
                step="1"
                value={cart.discount || ''}
                onChange={(e) => cart.setDiscount(Number(e.target.value) || 0)}
                style={{
                  width: '90px',
                  padding: '4px 8px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  textAlign: 'right',
                }}
              />
            </div>

            <div className={styles.summaryTotalRow}>
              <span>Grand Total</span>
              <span className="font-mono">₹{cart.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <Button
            variant="primary"
            size="lg"
            isLoading={submitting}
            disabled={cart.items.length === 0}
            onClick={handleCheckout}
            leftIcon={<CheckCircle size={20} />}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Complete Sale & Pay ₹{cart.grandTotal.toFixed(2)}
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Sticky Cart Drawer */}
      <div className={styles.mobileStickyCartBar}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cart.totalItemCount} items</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ₹{cart.grandTotal.toFixed(2)}
          </div>
        </div>
        <Button
          variant="primary"
          disabled={cart.items.length === 0}
          onClick={handleCheckout}
          isLoading={submitting}
        >
          Checkout ({cart.totalItemCount})
        </Button>
      </div>
    </div>
  );
};

export default NewBillPage;
