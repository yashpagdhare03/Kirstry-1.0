import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SalesHistoryPage } from './pages/billing/SalesHistoryPage';
import { NewBillPage } from './pages/billing/NewBillPage';
import { InvoiceViewPage } from './pages/billing/InvoiceViewPage';
import { DailySummaryPage } from './pages/billing/DailySummaryPage';
import { ProductListPage } from './pages/products/ProductListPage';
import { AddProductPage } from './pages/products/AddProductPage';
import { BarcodeLookupPage } from './pages/products/BarcodeLookupPage';
import { EditProductPage } from './pages/products/EditProductPage';
import { ProductDetailPage } from './pages/products/ProductDetailPage';
import { StockLevelsPage } from './pages/inventory/StockLevelsPage';
import { StockInPage } from './pages/inventory/StockInPage';
import { StockOutPage } from './pages/inventory/StockOutPage';
import { AdjustmentPage } from './pages/inventory/AdjustmentPage';
import { TransactionHistoryPage } from './pages/inventory/TransactionHistoryPage';
import { BatchDetailPage } from './pages/inventory/BatchDetailPage';
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
          <Route path="billing" element={<SalesHistoryPage />} />
          <Route path="billing/new" element={<NewBillPage />} />
          <Route path="billing/invoice/:sale_id" element={<InvoiceViewPage />} />
          <Route path="billing/summary" element={<DailySummaryPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/add" element={<AddProductPage />} />
          <Route path="products/barcode-lookup" element={<BarcodeLookupPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="products/:id/edit" element={<EditProductPage />} />
          <Route path="inventory" element={<StockLevelsPage />} />
          <Route path="inventory/stock-in" element={<StockInPage />} />
          <Route path="inventory/stock-out" element={<StockOutPage />} />
          <Route path="inventory/adjustment" element={<AdjustmentPage />} />
          <Route path="inventory/transactions" element={<TransactionHistoryPage />} />
          <Route path="inventory/batches/:product_id" element={<BatchDetailPage />} />
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
