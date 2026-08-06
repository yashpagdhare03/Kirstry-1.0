import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productService, type Category } from '../../services/products';
import { Button, Card, Input } from '../../components/shared';
import { ArrowLeft, Save, Barcode } from 'lucide-react';
import styles from './ProductPages.module.css';

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state || {};

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(prefilled.name || '');
  const [categoryId, setCategoryId] = useState(prefilled.category_id || '');
  const [brand, setBrand] = useState(prefilled.brand || '');
  const [unit, setUnit] = useState(prefilled.unit || 'pcs');
  const [barcode, setBarcode] = useState(prefilled.barcode || '');
  const [mrp, setMrp] = useState<number | string>(prefilled.mrp || '');
  const [sellingPrice, setSellingPrice] = useState<number | string>(prefilled.mrp || '');
  const [purchasePrice, setPurchasePrice] = useState<number | string>('');
  const [reorderThreshold, setReorderThreshold] = useState<number | string>(5);
  const [imageUrl, setImageUrl] = useState(prefilled.image_url || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await productService.getCategories();
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        // Silently handle
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await productService.createProduct({
        name: name.trim(),
        category_id: categoryId || undefined,
        brand: brand.trim() || undefined,
        unit: unit || 'pcs',
        barcode: barcode.trim() || undefined,
        mrp: Number(mrp) || 0,
        selling_price: Number(sellingPrice) || 0,
        purchase_price: Number(purchasePrice) || 0,
        reorder_threshold: Number(reorderThreshold) || 5,
        image_url: imageUrl.trim() || undefined,
      });

      if (res.success) {
        navigate('/products');
      } else {
        setError((res as any).message || 'Failed to create product');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Add New Product</h1>
          <p className={styles.subtitle}>Enter product details or auto-fill from Open Food Facts</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/products')}
          >
            Back to List
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Barcode size={16} />}
            onClick={() => navigate('/products/barcode-lookup')}
          >
            Scan Barcode
          </Button>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {error && (
            <div className={styles.fullRow} style={{ color: 'var(--state-error)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Product Name */}
          <div className={styles.fullRow}>
            <Input
              label="Product Name *"
              placeholder="e.g. Good Day Butter Biscuits 100g"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="container" style={{ gap: '6px' }}>
            <label className="label" style={{ fontSize: '13px', fontWeight: 500 }}>Category</label>
            <select
              className={styles.categorySelect}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <Input
            label="Brand"
            placeholder="e.g. Britannia"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />

          {/* Unit & Barcode */}
          <Input
            label="Unit of Measurement *"
            placeholder="pcs, kg, g, l, ml, pkt, box"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />

          <Input
            label="Barcode (EAN-13 / UPC)"
            isMono
            placeholder="e.g. 890123456789"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />

          {/* MRP & Selling Price */}
          <Input
            label="MRP (Maximum Retail Price) *"
            type="number"
            step="0.01"
            placeholder="0.00"
            isMono
            value={mrp}
            onChange={(e) => {
              setMrp(e.target.value);
              if (!sellingPrice) setSellingPrice(e.target.value);
            }}
            required
          />

          <Input
            label="Selling Price *"
            type="number"
            step="0.01"
            placeholder="0.00"
            isMono
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
          />

          {/* Purchase Price & Reorder Threshold */}
          <Input
            label="Default Purchase Price (Cost)"
            type="number"
            step="0.01"
            placeholder="0.00"
            isMono
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />

          <Input
            label="Low Stock Reorder Threshold"
            type="number"
            placeholder="5"
            isMono
            value={reorderThreshold}
            onChange={(e) => setReorderThreshold(e.target.value)}
          />

          {/* Image URL */}
          <div className={styles.fullRow}>
            <Input
              label="Product Image URL"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className={styles.imagePreview}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>

          {/* Form Actions */}
          <div className={`${styles.fullRow} ${styles.formActions}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              leftIcon={<Save size={16} />}
            >
              Save Product
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddProductPage;
