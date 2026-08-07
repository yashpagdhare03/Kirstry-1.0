import React, { useState, useEffect, useRef } from 'react';
import { productService, type Product } from '../../services/products';
import { Search, X, Package } from 'lucide-react';
import styles from '../../pages/inventory/InventoryPages.module.css';

export interface ProductSelectorProps {
  selectedProductId?: string;
  onSelectProduct: (product: Product | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProductId,
  onSelectProduct,
  label = 'Select Product *',
  placeholder = 'Search by product name, brand, or barcode...',
  disabled = false,
  required = false,
}) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync selected product if selectedProductId changes externally
  useEffect(() => {
    async function loadSelected() {
      if (!selectedProductId) {
        setSelectedProduct(null);
        return;
      }
      try {
        const res = await productService.getProduct(selectedProductId);
        if (res.success && res.data) {
          setSelectedProduct(res.data);
        }
      } catch (err) {
        // Silently handle
      }
    }
    if (selectedProductId && (!selectedProduct || (selectedProduct.product_id || (selectedProduct as any).id) !== selectedProductId)) {
      loadSelected();
    }
  }, [selectedProductId]);

  // Search API fetch on query change
  useEffect(() => {
    let active = true;
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await productService.getProducts({ search: query, is_active: true });
        if (active && res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (err) {
        // Silently handle
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      if (isOpen || query) {
        fetchProducts();
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    onSelectProduct(product);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setSelectedProduct(null);
    onSelectProduct(null);
    setQuery('');
  };

  const getStockCount = (p: Product) => {
    return p.total_stock ?? (p as any).current_stock ?? 0;
  };

  return (
    <div className={styles.selectorContainer} ref={containerRef}>
      <label className="label" style={{ fontSize: '13px', fontWeight: 500 }}>
        {label}
      </label>

      {selectedProduct ? (
        <div className={styles.selectedProductPill}>
          <div className={styles.selectedProductDetails}>
            <Package size={18} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div style={{ fontWeight: 600 }}>{selectedProduct.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {selectedProduct.brand ? `${selectedProduct.brand} • ` : ''}
                {selectedProduct.unit} • Stock: {getStockCount(selectedProduct)} {selectedProduct.unit}
              </div>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              title="Clear selection"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className={styles.selectorInputWrapper}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              required={required && !selectedProduct}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                backgroundColor: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {isOpen && (
            <div className={styles.selectorDropdown}>
              {loading ? (
                <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                  No matching products found
                </div>
              ) : (
                products.map((p) => (
                  <div
                    key={p.product_id || (p as any).id}
                    className={styles.selectorItem}
                    onClick={() => handleSelect(p)}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {p.brand ? `${p.brand} • ` : ''}
                        {p.unit} {p.barcode ? `• ${p.barcode}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      Stock: {getStockCount(p)} {p.unit}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
