import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, type BarcodeLookupResult } from '../../services/products';
import { Button, Card, Input, Badge, EmptyState } from '../../components/shared';
import { ArrowLeft, Search, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './ProductPages.module.css';

export const BarcodeLookupPage: React.FC = () => {
  const navigate = useNavigate();
  const [barcodeInput, setBarcodeInput] = useState('890123456789');
  const [result, setResult] = useState<BarcodeLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await productService.lookupBarcode(barcodeInput.trim());
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError('No product details found for this barcode in Open Food Facts database.');
      }
    } catch (err: any) {
      setError('Barcode lookup service request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportToForm = () => {
    if (!result) return;
    navigate('/products/add', {
      state: {
        name: result.product_name || '',
        brand: result.brand || '',
        barcode: result.barcode || barcodeInput,
        mrp: result.mrp || '',
        image_url: result.image_url || '',
        unit: 'pcs',
      },
    });
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Open Food Facts Barcode Lookup</h1>
          <p className={styles.subtitle}>Scan or enter EAN/UPC barcode to fetch product details</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/products')}
        >
          Back to List
        </Button>
      </div>

      {/* Barcode Search Card */}
      <Card title="Enter Barcode Number">
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              isMono
              placeholder="e.g. 890123456789"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            leftIcon={<Search size={16} />}
          >
            Lookup Barcode
          </Button>
        </form>
      </Card>

      {/* Lookup Result Card */}
      {result && (
        <Card
          title="Lookup Result"
          subtitle={`Source: ${result.source || 'Open Food Facts'}`}
          action={
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={handleImportToForm}
            >
              Use in Product Form
            </Button>
          }
        >
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {result.image_url ? (
              <img
                src={result.image_url}
                alt={result.product_name}
                className={styles.imagePreview}
              />
            ) : (
              <div
                className={styles.imagePreview}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                No Image
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{result.product_name || 'Unknown Product'}</h3>
                {result.brand && (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Brand: {result.brand}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Badge variant="info" icon={<CheckCircle2 size={12} />}>
                  Barcode: {result.barcode}
                </Badge>
                {result.category && <Badge variant="default">Category: {result.category}</Badge>}
              </div>

              {result.mrp && (
                <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  MRP: ₹{result.mrp}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Error / Empty State */}
      {error && (
        <EmptyState
          icon={<AlertCircle size={48} style={{ color: 'var(--state-warning)' }} />}
          title="No product details found"
          description={error}
          action={
            <Button
              variant="primary"
              onClick={() =>
                navigate('/products/add', { state: { barcode: barcodeInput } })
              }
            >
              Add Product Manually
            </Button>
          }
        />
      )}
    </div>
  );
};

export default BarcodeLookupPage;
