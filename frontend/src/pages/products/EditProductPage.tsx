import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, type Category, type Product } from '../../services/products';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import { ArrowLeft, Save, Upload, Trash2 } from 'lucide-react';
import styles from './ProductPages.module.css';

export const EditProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [barcode, setBarcode] = useState('');
  const [mrp, setMrp] = useState<number | string>('');
  const [sellingPrice, setSellingPrice] = useState<number | string>('');
  const [purchasePrice, setPurchasePrice] = useState<number | string>('');
  const [reorderThreshold, setReorderThreshold] = useState<number | string>(5);
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getProduct(id),
          productService.getCategories(),
        ]);

        if (prodRes.success && prodRes.data) {
          const p = prodRes.data;
          setProduct(p);
          setName(p.name);
          setCategoryId(p.category_id || '');
          setBrand(p.brand || '');
          setUnit(p.unit || 'pcs');
          setBarcode(p.barcode || '');
          setMrp(p.mrp);
          setSellingPrice(p.selling_price);
          setPurchasePrice(p.purchase_price);
          setReorderThreshold(p.reorder_threshold);
          setImageUrl(p.image_url || '');
        }
        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const res = await productService.uploadProductImage(file);
      if (res.success && res.data?.image_url) {
        setImageUrl(res.data.image_url);
      } else {
        const localPreview = URL.createObjectURL(file);
        setImageUrl(localPreview);
      }
    } catch (err: any) {
      const localPreview = URL.createObjectURL(file);
      setImageUrl(localPreview);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await productService.updateProduct(id, {
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
        setError((res as any).message || 'Failed to update product');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving changes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Edit Product</h1>
          <p className={styles.subtitle}>
            {product ? `Updating parameters for ${product.name}` : 'Update product parameters and selling prices'}
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/products')}
        >
          Back to List
        </Button>
      </div>

      <Card>
        {loading ? (
          <Skeleton height={300} />
        ) : (
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            {error && (
              <div className={styles.fullRow} style={{ color: 'var(--state-error)', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div className={styles.fullRow}>
              <Input
                label="Product Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            <Input
              label="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />

            <Input
              label="Unit of Measurement *"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />

            <Input
              label="Barcode (EAN-13 / UPC)"
              isMono
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />

            <Input
              label="MRP *"
              type="number"
              step="0.01"
              isMono
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              required
            />

            <Input
              label="Selling Price *"
              type="number"
              step="0.01"
              isMono
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              required
            />

            <Input
              label="Default Purchase Price (Cost)"
              type="number"
              step="0.01"
              isMono
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />

            <Input
              label="Low Stock Reorder Threshold"
              type="number"
              isMono
              value={reorderThreshold}
              onChange={(e) => setReorderThreshold(e.target.value)}
            />

            {/* Image File Upload */}
            <div className={styles.fullRow} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="label" style={{ fontSize: '13px', fontWeight: 500 }}>
                Product Image Upload
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <Upload size={16} />
                  {uploadingImage ? 'Uploading Image...' : 'Choose Image File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'none' }}
                    disabled={uploadingImage}
                  />
                </label>

                {imageUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={imageUrl}
                      alt="Uploaded Preview"
                      className={styles.imagePreview}
                      style={{ width: '64px', height: '64px', borderRadius: '8px' }}
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setImageUrl('')}
                      leftIcon={<Trash2 size={14} />}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

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
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default EditProductPage;
