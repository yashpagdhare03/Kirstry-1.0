import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supplierService, type Supplier } from '../../services/supplier';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import {
  Truck,
  PlusCircle,
  FileText,
  Phone,
  Package,
  Trash2,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import styles from './SupplierPages.module.css';

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getSuppliers({ search: search || undefined });
      if (res.success && res.data) {
        setSuppliers(res.data.suppliers || []);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  const handleDelete = async (supplierId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete supplier '${name}'?`)) return;

    setError(null);
    try {
      const res = await supplierService.deleteSupplier(supplierId);
      if (res.success) {
        fetchSuppliers();
      } else {
        setError((res as any).message || 'Failed to delete supplier');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting supplier. Make sure there are no active purchase orders linked.');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Supplier Directory</h1>
          <p className={styles.subtitle}>Manage wholesale vendors, items supplied, and purchase order fulfillment</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            leftIcon={<FileText size={16} />}
            onClick={() => navigate('/purchase-orders')}
          >
            All Purchase Orders
          </Button>
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={16} />}
            onClick={() => navigate('/suppliers/add')}
          >
            Add Supplier
          </Button>
        </div>
      </div>

      {error && (
        <Card style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>{error}</div>
        </Card>
      )}

      {/* Search Bar */}
      <div style={{ maxWidth: '360px' }}>
        <Input
          placeholder="Search supplier by name or items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Supplier Grid */}
      {loading ? (
        <Skeleton height={300} />
      ) : suppliers.length === 0 ? (
        <Card>
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Truck size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              No wholesale suppliers found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Click 'Add Supplier' to register vendor contact details.
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.supplierGrid}>
          {suppliers.map((s) => {
            const sid = s.supplier_id || (s as any).id;
            return (
              <div key={sid} className={styles.supplierCard}>
                <div>
                  <div className={styles.supplierTitle}>{s.name}</div>
                  <div className={styles.supplierMeta} style={{ marginTop: '6px' }}>
                    <Phone size={14} />
                    {s.phone || 'No phone provided'}
                  </div>
                  <div className={styles.supplierMeta} style={{ marginTop: '4px' }}>
                    <Package size={14} />
                    {s.items_supplied || 'General Provisions'}
                  </div>
                </div>

                <div className={styles.supplierActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye size={14} />}
                    onClick={() => navigate(`/suppliers/${sid}`)}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<ShoppingBag size={14} />}
                    onClick={() => navigate(`/suppliers/${sid}/purchase-order/new`)}
                  >
                    Create PO
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sid, s.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--state-error)',
                      cursor: 'pointer',
                      padding: '6px',
                      marginLeft: 'auto',
                    }}
                    title="Delete Supplier"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupplierListPage;
