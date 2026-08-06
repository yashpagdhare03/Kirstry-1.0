import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Button,
  Input,
  SearchInput,
  Card,
  Modal,
  Table,
  Badge,
  EmptyState,
  Skeleton,
} from './components/shared';
import { Package, ShieldAlert, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import './App.css';

function DesignSystemShowcase() {
  const [searchValue, setSearchValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sampleTableColumns = [
    { header: 'Product Name', accessor: (row: any) => <strong>{row.name}</strong> },
    { header: 'Barcode', accessor: (row: any) => <span className="font-mono">{row.barcode}</span> },
    { header: 'Stock', accessor: (row: any) => `${row.stock} ${row.unit}` },
    {
      header: 'Status',
      accessor: (row: any) => (
        <Badge variant={row.stock <= 5 ? 'error' : row.stock <= 15 ? 'warning' : 'success'}>
          {row.stock <= 5 ? 'Low Stock' : row.stock <= 15 ? 'Moderate' : 'In Stock'}
        </Badge>
      ),
    },
  ];

  const sampleTableData = [
    { name: 'Good Day Biscuits 100g', barcode: '890123456789', stock: 42, unit: 'pkts' },
    { name: 'Amul Butter 500g', barcode: '890987654321', stock: 4, unit: 'packs' },
    { name: 'Tata Salt 1kg', barcode: '890555444333', stock: 12, unit: 'bags' },
  ];

  return (
    <div className="showcase">
      <header className="header">
        <h1>Kirstry 1.0 — Design System Gallery</h1>
        <p>Monochrome Dark Mode Design Language (`ui-context.md`)</p>
      </header>

      {/* 1. Color Palette Tokens */}
      <section className="section">
        <h2 className="sectionTitle">Design Tokens & Color Swatches</h2>
        <div className="colorGrid">
          <div className="colorSwatch" style={{ backgroundColor: 'var(--bg-base)' }}>
            <span className="swatchLabel">--bg-base</span>
            <span className="swatchVal" style={{ color: 'var(--text-primary)' }}>#0A0A0A</span>
          </div>
          <div className="colorSwatch" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <span className="swatchLabel">--bg-surface</span>
            <span className="swatchVal" style={{ color: 'var(--text-primary)' }}>#141414</span>
          </div>
          <div className="colorSwatch" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
            <span className="swatchLabel">--bg-surface-alt</span>
            <span className="swatchVal" style={{ color: 'var(--text-primary)' }}>#1C1C1C</span>
          </div>
          <div className="colorSwatch" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
            <span className="swatchLabel">--border-default</span>
            <span className="swatchVal" style={{ color: 'var(--border-default)' }}>#262626</span>
          </div>
        </div>
      </section>

      {/* 2. Buttons */}
      <section className="section">
        <h2 className="sectionTitle">Buttons</h2>
        <div className="row">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="danger">Danger Action</Button>
          <Button variant="primary" isLoading>Loading</Button>
          <Button variant="secondary" leftIcon={<Package size={16} />}>Icon Button</Button>
        </div>
      </section>

      {/* 3. Inputs & Search */}
      <section className="section">
        <h2 className="sectionTitle">Form Inputs</h2>
        <div className="row" style={{ width: '100%', maxWidth: '600px' }}>
          <Input
            label="Product Name"
            placeholder="e.g. Fortune Refined Oil 1L"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input
            label="Invoice Number (Monospace)"
            isMono
            value="INV-20260806-0001"
            readOnly
          />
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue('')}
            placeholder="Search products by name or barcode..."
          />
        </div>
      </section>

      {/* 4. Badges */}
      <section className="section">
        <h2 className="sectionTitle">Badges</h2>
        <div className="row">
          <Badge variant="default">Default</Badge>
          <Badge variant="info" icon={<Info size={12} />}>Info</Badge>
          <Badge variant="success" icon={<CheckCircle size={12} />}>In Stock</Badge>
          <Badge variant="warning" icon={<AlertTriangle size={12} />}>3 Days Left</Badge>
          <Badge variant="error" icon={<ShieldAlert size={12} />}>Critical Out of Stock</Badge>
        </div>
      </section>

      {/* 5. Cards & Modals */}
      <section className="section">
        <h2 className="sectionTitle">Cards & Modal Overlays</h2>
        <div className="row">
          <Card title="Today Revenue" subtitle="Real-time POS summary" style={{ width: '280px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              ₹12,450.00
            </div>
          </Card>
          <Card title="Modal Demonstration" subtitle="Click to test Radix UI modal overlay" style={{ width: '280px' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          </Card>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Sample Modal Dialog"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm Action</Button>
            </>
          }
        >
          <p style={{ color: 'var(--text-muted)' }}>
            This modal uses <strong>@radix-ui/react-dialog</strong> with a backdrop blur overlay and 14px border radius matching `ui-context.md`.
          </p>
        </Modal>
      </section>

      {/* 6. Tables & Skeletons */}
      <section className="section">
        <h2 className="sectionTitle">Data Tables & Skeleton Shimmer</h2>
        <Table columns={sampleTableColumns} data={sampleTableData} keyExtractor={(r) => r.barcode} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          <Skeleton height={24} width="60%" />
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} width="40%" />
        </div>
      </section>

      {/* 7. Empty State */}
      <section className="section">
        <h2 className="sectionTitle">Empty State</h2>
        <EmptyState
          title="No products found"
          description="Try scanning a barcode or adding a new item to your inventory catalog."
          action={<Button variant="primary">Add Product</Button>}
        />
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DesignSystemShowcase />} />
      </Routes>
    </Router>
  );
}
