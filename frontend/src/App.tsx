import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { BillingPage } from './pages/BillingPage';
import { ProductListPage } from './pages/products/ProductListPage';
import { AddProductPage } from './pages/products/AddProductPage';
import { BarcodeLookupPage } from './pages/products/BarcodeLookupPage';
import { EditProductPage } from './pages/products/EditProductPage';
import { ProductDetailPage } from './pages/products/ProductDetailPage';
import { InventoryPage } from './pages/InventoryPage';
import { KhataPage } from './pages/KhataPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AlertsPage } from './pages/AlertsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/add" element={<AddProductPage />} />
          <Route path="products/barcode-lookup" element={<BarcodeLookupPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="products/:id/edit" element={<EditProductPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="khata" element={<KhataPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
