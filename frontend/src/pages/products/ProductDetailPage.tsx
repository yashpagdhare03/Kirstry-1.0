import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, type Product } from '../../services/products';
import { Button, Card, Badge, Skeleton, EmptyState } from '../../components/shared';
import { ArrowLeft, Edit, Package, Barcode, TrendingUp, Boxes } from 'lucide-react';
import styles from './ProductPages.module.css';

export const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await productService.getProduct(id);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError('Error loading product details.');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Skeleton height={200} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="Product not found"
          description={error || 'The requested product could not be located.'}
          action={
            <Button variant="primary" onClick={() => navigate('/products')}>
              Back to Catalog
            </Button>
          }
        />
      </div>
    );
  }

  const margin = product.selling_price > 0 && product.purchase_price > 0
    ? (((product.selling_price - product.purchase_price) / product.selling_price) * 100).toFixed(1)
    : '0.0';

  const stock = product.total_stock || 0;
  const threshold = product.reorder_threshold || 5;

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.subtitle}>
            Category: {product.category_name || 'General'} {product.brand ? `• Brand: ${product.brand}` : ''}
          </p>
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
            variant="primary"
            leftIcon={<Edit size={16} />}
            onClick={() => navigate(`/products/${product.product_id}/edit`)}
          >
            Edit Product
          </Button>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className={styles.detailGrid}>
        {/* Product Image Card */}
        <Card title="Product Media">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className={styles.imagePreview}
                style={{ width: '100%', height: '220px' }}
              />
            ) : (
              <div
                className={styles.imagePreview}
                style={{
                  width: '100%',
                  height: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <Package size={48} />
              </div>
            )}
            {product.barcode && (
              <Badge variant="info" icon={<Barcode size={12} />}>
                EAN: <span className="font-mono">{product.barcode}</span>
              </Badge>
            )}
          </div>
        </Card>

        {/* Pricing & Stock Card */}
        <Card title="Pricing & Inventory Profile">
          <div className={styles.priceGrid}>
            <div className={styles.priceStat}>
              <span className={styles.statLabel}>MRP</span>
              <span className={styles.statValue}>₹{product.mrp?.toFixed(2)}</span>
            </div>

            <div className={styles.priceStat}>
              <span className={styles.statLabel}>Selling Price</span>
              <span className={styles.statValue} style={{ color: 'var(--state-success)' }}>
                ₹{product.selling_price?.toFixed(2)}
              </span>
            </div>

            <div className={styles.priceStat}>
              <span className={styles.statLabel}>Purchase Cost</span>
              <span className={styles.statValue}>₹{product.purchase_price?.toFixed(2)}</span>
            </div>

            <div className={styles.priceStat}>
              <span className={styles.statLabel}>Estimated Profit Margin</span>
              <span className={styles.statValue} style={{ color: Number(margin) > 0 ? 'var(--state-success)' : 'var(--text-muted)' }}>
                {margin}%
              </span>
            </div>

            <div className={styles.priceStat}>
              <span className={styles.statLabel}>Current Total Stock</span>
              <span className={styles.statValue}>{stock} {product.unit}</span>
            </div>

            <div className={styles.priceStat}>
              <span className={styles.statLabel}>Stock Status</span>
              <div style={{ marginTop: '4px' }}>
                <Badge variant={stock <= 0 ? 'error' : stock <= threshold ? 'warning' : 'success'}>
                  {stock <= 0 ? 'Out of Stock' : stock <= threshold ? 'Low Stock' : 'In Stock'}
                </Badge>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <Button
              variant="secondary"
              leftIcon={<Boxes size={16} />}
              onClick={() => navigate('/inventory')}
            >
              Stock-In Batch
            </Button>
            <Button
              variant="outline"
              leftIcon={<TrendingUp size={16} />}
              onClick={() => navigate('/analytics')}
            >
              View Analytics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetailPage;
