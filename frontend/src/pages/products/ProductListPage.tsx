import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, type Product, type Category } from '../../services/products';
import {
  Button,
  Card,
  Table,
  Badge,
  SearchInput,
  Modal,
  Skeleton,
  EmptyState,
} from '../../components/shared';
import { Plus, Barcode, Eye, Edit, Trash2, Package } from 'lucide-react';
import styles from './ProductPages.module.css';

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({
          search: search.trim() || undefined,
          category_id: selectedCategory || undefined,
          is_active: true,
        }),
        productService.getCategories(),
      ]);

      if (prodRes.success && Array.isArray(prodRes.data)) {
        setProducts(prodRes.data);
      }
      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
    } catch (err) {
      // Handle fetch error
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await productService.deleteProduct(deleteTarget.product_id);
      if (res.success) {
        setDeleteTarget(null);
        fetchCatalog();
      }
    } catch (err) {
      // Handle delete error
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Product Name',
      accessor: (row: Product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {row.image_url ? (
            <img
              src={row.image_url}
              alt={row.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Package size={16} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            {row.brand && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.brand}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (row: Product) => row.category_name || 'General',
    },
    {
      header: 'Barcode',
      accessor: (row: Product) =>
        row.barcode ? <span className="font-mono">{row.barcode}</span> : '—',
    },
    {
      header: 'MRP',
      accessor: (row: Product) => (
        <span className="font-mono">₹{Number(row.mrp || 0).toFixed(2)}</span>
      ),
    },
    {
      header: 'Selling Price',
      accessor: (row: Product) => (
        <span className="font-mono" style={{ fontWeight: 700 }}>
          ₹{Number(row.selling_price || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Stock',
      accessor: (row: Product) => {
        const stock = row.total_stock || 0;
        const threshold = row.reorder_threshold || 5;
        const variant = stock <= 0 ? 'error' : stock <= threshold ? 'warning' : 'success';
        return (
          <Badge variant={variant}>
            {stock} {row.unit || 'pcs'}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: Product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/products/${row.product_id}`)}
            title="View Details"
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/products/${row.product_id}/edit`)}
            title="Edit Product"
          >
            <Edit size={14} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            title="Delete Product"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Products Catalog</h1>
          <p className={styles.subtitle}>Manage inventory items, barcodes, and prices</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            leftIcon={<Barcode size={16} />}
            onClick={() => navigate('/products/barcode-lookup')}
          >
            Barcode Lookup
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/products/add')}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card style={{ padding: '12px' }}>
        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search by name, brand, or barcode..."
            />
          </div>
          <select
            className={styles.categorySelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Product List Table */}
      <Card>
        {loading ? (
          <Skeleton height={200} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Add products manually or use Open Food Facts barcode lookup."
            action={
              <Button variant="primary" onClick={() => navigate('/products/add')}>
                Add Product
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={products}
            keyExtractor={(row) => row.product_id}
          />
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Soft Delete"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={handleDeleteConfirm}
            >
              Delete Product
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-muted)' }}>
          Are you sure you want to deactivate <strong>{deleteTarget?.name}</strong>? It will be removed from active inventory catalog search.
        </p>
      </Modal>
    </div>
  );
};

export default ProductListPage;
