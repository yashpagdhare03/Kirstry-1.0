import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { StoreSetupPage } from './pages/auth/StoreSetupPage';
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
import { CustomerListPage } from './pages/khata/CustomerListPage';
import { AddCustomerPage } from './pages/khata/AddCustomerPage';
import { CustomerDetailPage } from './pages/khata/CustomerDetailPage';
import { OutstandingPage } from './pages/khata/OutstandingPage';
import { SupplierListPage } from './pages/suppliers/SupplierListPage';
import { AddSupplierPage } from './pages/suppliers/AddSupplierPage';
import { SupplierDetailPage } from './pages/suppliers/SupplierDetailPage';
import { CreatePurchaseOrderPage } from './pages/suppliers/CreatePurchaseOrderPage';
import { PurchaseOrderListPage } from './pages/suppliers/PurchaseOrderListPage';
import { PurchaseOrderDetailPage } from './pages/suppliers/PurchaseOrderDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AlertsPage } from './pages/AlertsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Unauthenticated Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Onboarding Wizard */}
          <Route
            path="/store-setup"
            element={
              <ProtectedRoute>
                <StoreSetupPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Application Layout & Pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
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
            <Route path="khata" element={<CustomerListPage />} />
            <Route path="khata/add" element={<AddCustomerPage />} />
            <Route path="khata/outstanding" element={<OutstandingPage />} />
            <Route path="khata/:customer_id" element={<CustomerDetailPage />} />
            <Route path="suppliers" element={<SupplierListPage />} />
            <Route path="suppliers/add" element={<AddSupplierPage />} />
            <Route path="suppliers/:id" element={<SupplierDetailPage />} />
            <Route path="suppliers/:id/purchase-order/new" element={<CreatePurchaseOrderPage />} />
            <Route path="purchase-orders" element={<PurchaseOrderListPage />} />
            <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
