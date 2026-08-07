import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import {
  Button,
  Card,
  Table,
  Badge,
  Skeleton,
  EmptyState,
} from '../components/shared';
import {
  Package,
  Boxes,
  AlertTriangle,
  Clock,
  TrendingUp,
  Receipt,
  BookOpen,
  RefreshCw,
  Plus,
  ArrowRight,
  Share2,
} from 'lucide-react';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, expiryAlerts, lowStockAlerts, recentSales, loading, error, refreshDashboard } =
    useDashboard();

  const safeLowStock = Array.isArray(lowStockAlerts) ? lowStockAlerts : [];
  const safeExpiry = Array.isArray(expiryAlerts) ? expiryAlerts : [];
  const safeSales = Array.isArray(recentSales) ? recentSales : [];

  const sampleTableColumns = [
    {
      header: 'Invoice #',
      accessor: (row: any) => (
        <span className="font-mono" style={{ fontWeight: 600 }}>
          {row.invoice_number}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: (row: any) => row.customer_name || 'Walk-in Customer',
    },
    {
      header: 'Items',
      accessor: (row: any) => `${row.item_count || 1} items`,
    },
    {
      header: 'Payment',
      accessor: (row: any) => (
        <Badge
          variant={
            row.payment_mode === 'cash'
              ? 'success'
              : row.payment_mode === 'upi'
              ? 'info'
              : 'warning'
          }
        >
          {row.payment_mode ? String(row.payment_mode).toUpperCase() : 'CASH'}
        </Badge>
      ),
    },
    {
      header: 'Total Amount',
      accessor: (row: any) => (
        <span className="font-mono" style={{ fontWeight: 700 }}>
          ₹{Number(row.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/billing/invoice/${row.sale_id}`)}
          leftIcon={<Share2 size={12} />}
        >
          Invoice
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.greeting}>
          <h1 className={styles.title}>Store Overview</h1>
          <p className={styles.subtitle}>Real-time inventory status & sales counter</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshDashboard}
          isLoading={loading}
          leftIcon={<RefreshCw size={14} />}
        >
          Refresh
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <Badge variant="error" style={{ padding: '10px 14px', fontSize: '13px', width: '100%' }}>
          {error}
        </Badge>
      )}

      {/* 1. Stock Summary Metrics Grid */}
      <div className={styles.summaryGrid}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton height={18} width="50%" />
              <Skeleton height={32} width="80%" />
              <Skeleton height={14} width="40%" />
            </Card>
          ))
        ) : (
          <>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Total Catalog Items</span>
                <span className={styles.metricIcon}>
                  <Package size={18} strokeWidth={1.5} />
                </span>
              </div>
              <div className={styles.metricValue}>{summary?.total_products || 0}</div>
              <span className={styles.subtitle}>
                {summary?.total_categories || 0} categories active
              </span>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Inventory Value</span>
                <span className={styles.metricIcon}>
                  <Boxes size={18} strokeWidth={1.5} />
                </span>
              </div>
              <div className={styles.metricValue}>
                ₹{Number(summary?.total_inventory_value || 0).toLocaleString('en-IN', {
                  maximumFractionDigits: 0,
                })}
              </div>
              <span className={styles.subtitle}>Total stock valuation</span>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Low Stock Alert</span>
                <span
                  className={styles.metricIcon}
                  style={{
                    color: (summary?.low_stock_count || 0) > 0 ? 'var(--state-error)' : 'inherit',
                  }}
                >
                  <AlertTriangle size={18} strokeWidth={1.5} />
                </span>
              </div>
              <div className={styles.metricValue}>{summary?.low_stock_count || 0}</div>
              {(summary?.low_stock_count || 0) > 0 ? (
                <Badge variant="error">Requires Reorder</Badge>
              ) : (
                <Badge variant="success">Optimal Stock</Badge>
              )}
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Today's POS Sales</span>
                <span className={styles.metricIcon}>
                  <TrendingUp size={18} strokeWidth={1.5} />
                </span>
              </div>
              <div className={styles.metricValue}>
                ₹{Number(summary?.today_sales_revenue || 0).toLocaleString('en-IN', {
                  maximumFractionDigits: 0,
                })}
              </div>
              <span className={styles.subtitle}>
                {summary?.today_sales_count || 0} invoices created today
              </span>
            </div>
          </>
        )}
      </div>

      {/* 2. Quick Actions Bar */}
      <div className={styles.quickActions}>
        <Button
          variant="primary"
          leftIcon={<Receipt size={16} />}
          onClick={() => navigate('/billing')}
          fullWidth
        >
          New POS Bill
        </Button>
        <Button
          variant="secondary"
          leftIcon={<Plus size={16} />}
          onClick={() => navigate('/inventory')}
          fullWidth
        >
          Stock In
        </Button>
        <Button
          variant="outline"
          leftIcon={<Package size={16} />}
          onClick={() => navigate('/products')}
          fullWidth
        >
          Add Product
        </Button>
        <Button
          variant="outline"
          leftIcon={<BookOpen size={16} />}
          onClick={() => navigate('/khata')}
          fullWidth
        >
          Digital Khata
        </Button>
      </div>

      {/* 3. Alert Feeds Grid */}
      <div className={styles.alertsGrid}>
        {/* Low Stock Feed */}
        <Card
          title="Low Stock Warnings"
          subtitle="Products below reorder threshold"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/inventory')}
              rightIcon={<ArrowRight size={12} />}
            >
              Manage
            </Button>
          }
        >
          {loading ? (
            <Skeleton height={100} />
          ) : safeLowStock.length === 0 ? (
            <EmptyState
              title="No low stock items"
              description="All products are above reorder threshold."
            />
          ) : (
            <div className={styles.alertList}>
              {safeLowStock.map((item) => (
                <div key={item.product_id} className={styles.alertItem}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertTitle}>{item.product_name}</span>
                    <span className={styles.alertMeta}>
                      Current: {item.current_stock} | Threshold: {item.reorder_threshold}
                    </span>
                  </div>
                  <Badge variant="error">Deficit: {item.deficit}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Expiry Alerts Feed */}
        <Card
          title="Expiring Batches (7 Days)"
          subtitle="Stock batches nearing expiration"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/alerts')}
              rightIcon={<ArrowRight size={12} />}
            >
              All Alerts
            </Button>
          }
        >
          {loading ? (
            <Skeleton height={100} />
          ) : safeExpiry.length === 0 ? (
            <EmptyState
              title="No expiring stock"
              description="No batches expiring within the next 7 days."
            />
          ) : (
            <div className={styles.alertList}>
              {safeExpiry.map((batch) => (
                <div key={batch.batch_id} className={styles.alertItem}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertTitle}>{batch.product_name}</span>
                    <span className={styles.alertMeta}>
                      Batch: {batch.batch_number} | Qty: {batch.quantity} | Expires: {batch.expiry_date}
                    </span>
                  </div>
                  <Badge
                    variant={
                      batch.urgency === '1_day'
                        ? 'error'
                        : batch.urgency === '3_days'
                        ? 'warning'
                        : 'info'
                    }
                    icon={<Clock size={12} />}
                  >
                    {batch.days_until_expiry <= 0
                      ? 'EXPIRED TODAY'
                      : `${batch.days_until_expiry}d left`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 4. Recent Sales Table */}
      <Card
        title="Recent Sales Transactions"
        subtitle="Latest 5 POS bills created today"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/billing')}
            rightIcon={<ArrowRight size={12} />}
          >
            Sales History
          </Button>
        }
      >
        {loading ? (
          <Skeleton height={140} />
        ) : safeSales.length === 0 ? (
          <EmptyState
            title="No sales transactions yet"
            description="Create your first bill using the POS counter."
            action={
              <Button variant="primary" onClick={() => navigate('/billing')}>
                Create POS Bill
              </Button>
            }
          />
        ) : (
          <Table
            columns={sampleTableColumns}
            data={safeSales}
            keyExtractor={(row) => row.sale_id || row.invoice_number}
          />
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
