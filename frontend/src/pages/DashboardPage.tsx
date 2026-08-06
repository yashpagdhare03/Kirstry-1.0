import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import {
  Button,
  Card,
  Badge,
  Table,
  Skeleton,
  EmptyState,
} from '../components/shared';
import {
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  Receipt,
  Boxes,
  PlusCircle,
  BookOpen,
  RefreshCw,
  IndianRupee,
} from 'lucide-react';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    summary,
    expiryAlerts,
    lowStockAlerts,
    recentSales,
    isLoading,
    error,
    refreshDashboard,
  } = useDashboard();

  // Columns for Recent Sales Table
  const salesColumns = [
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
      accessor: (row: any) =>
        row.customers?.name || row.customer_name || 'Walk-in Customer',
    },
    {
      header: 'Items',
      accessor: (row: any) =>
        `${row.items_count || (row.items ? row.items.length : 1)} items`,
    },
    {
      header: 'Amount',
      accessor: (row: any) => (
        <span className="font-mono" style={{ fontWeight: 700 }}>
          ₹{Number(row.total_amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Payment Mode',
      accessor: (row: any) => {
        const mode = row.payment_mode || 'cash';
        let variant: 'success' | 'info' | 'warning' = 'success';
        if (mode === 'upi') variant = 'info';
        if (mode === 'credit') variant = 'warning';
        return <Badge variant={variant}>{mode.toUpperCase()}</Badge>;
      },
    },
    {
      header: 'Date & Time',
      accessor: (row: any) =>
        new Date(row.created_at || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Header & Refresh */}
      <div className={styles.headerSection}>
        <div className={styles.headerTitle}>
          <h2 className={styles.title}>Store Overview</h2>
          <span className={styles.subtitle}>Real-time inventory and POS summary</span>
        </div>
        <Button
          variant="outline"
          leftIcon={<RefreshCw size={16} className={isLoading ? 'spin' : ''} />}
          onClick={refreshDashboard}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Card style={{ borderColor: 'var(--state-error)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ color: 'var(--state-error)', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        </Card>
      )}

      {/* 1. Metric Cards Grid */}
      <div className={styles.metricsGrid}>
        {isLoading ? (
          <>
            <Skeleton height={100} borderRadius="10px" />
            <Skeleton height={100} borderRadius="10px" />
            <Skeleton height={100} borderRadius="10px" />
            <Skeleton height={100} borderRadius="10px" />
          </>
        ) : (
          <>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Total Products</span>
                <div className={styles.metricIcon}>
                  <Package size={18} strokeWidth={1.5} />
                </div>
              </div>
              <div className={styles.metricValue}>
                {summary?.total_products ?? 0}
              </div>
              <div className={styles.metricFooter}>Active Catalog SKUs</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Inventory Valuation</span>
                <div className={styles.metricIcon}>
                  <IndianRupee size={18} strokeWidth={1.5} />
                </div>
              </div>
              <div className={styles.metricValue}>
                ₹{Number(summary?.total_inventory_value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className={styles.metricFooter}>Total Stock Value</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Low Stock Items</span>
                <div className={styles.metricIcon} style={{ color: summary?.low_stock_count ? 'var(--state-error)' : 'inherit' }}>
                  <AlertTriangle size={18} strokeWidth={1.5} />
                </div>
              </div>
              <div className={styles.metricValue} style={{ color: summary?.low_stock_count ? 'var(--state-error)' : 'inherit' }}>
                {summary?.low_stock_count ?? 0}
              </div>
              <div className={styles.metricFooter}>
                {summary?.low_stock_count ? (
                  <Badge variant="error">Needs Reorder</Badge>
                ) : (
                  <Badge variant="success">All Stocked</Badge>
                )}
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Today's Revenue</span>
                <div className={styles.metricIcon} style={{ color: 'var(--state-success)' }}>
                  <TrendingUp size={18} strokeWidth={1.5} />
                </div>
              </div>
              <div className={styles.metricValue}>
                ₹{Number(summary?.today_sales_revenue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className={styles.metricFooter}>
                {summary?.today_sales_count ?? 0} completed orders today
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. Quick Actions Bar */}
      <div className={styles.actionsBar}>
        <h3 className={styles.actionsTitle}>Quick POS Actions</h3>
        <div className={styles.actionsGrid}>
          <Button
            variant="primary"
            leftIcon={<Receipt size={16} />}
            onClick={() => navigate('/billing')}
          >
            New POS Bill
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Boxes size={16} />}
            onClick={() => navigate('/inventory')}
          >
            Stock In
          </Button>
          <Button
            variant="outline"
            leftIcon={<PlusCircle size={16} />}
            onClick={() => navigate('/products')}
          >
            Add Product
          </Button>
          <Button
            variant="outline"
            leftIcon={<BookOpen size={16} />}
            onClick={() => navigate('/khata')}
          >
            Digital Khata Entry
          </Button>
        </div>
      </div>

      {/* 3. Feeds Grid (Low Stock & Expiry Alerts) */}
      <div className={styles.feedsGrid}>
        {/* Low Stock Feed */}
        <Card title="Low Stock Alerts" subtitle="Items below threshold">
          {isLoading ? (
            <Skeleton height={150} borderRadius="8px" />
          ) : lowStockAlerts.length === 0 ? (
            <EmptyState title="No Low Stock Warnings" description="All items are above min stock threshold." />
          ) : (
            <div className={styles.feedList}>
              {lowStockAlerts.map((product) => (
                <div key={product.id} className={styles.feedItem}>
                  <div className={styles.feedItemInfo}>
                    <span className={styles.feedItemName}>{product.name}</span>
                    <span className={styles.feedItemMeta}>
                      Stock: <strong>{product.current_stock ?? 0}</strong> {product.unit} (Min: {product.low_stock_threshold})
                    </span>
                  </div>
                  <Badge variant="error">Low Stock</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Expiry Alerts Feed */}
        <Card title="Expiring Batches" subtitle="Batches expiring within 7 days">
          {isLoading ? (
            <Skeleton height={150} borderRadius="8px" />
          ) : !expiryAlerts || (expiryAlerts.items && expiryAlerts.items.length === 0) ? (
            <EmptyState title="No Expiring Stock" description="No batches expiring in the next 7 days." />
          ) : (
            <div className={styles.feedList}>
              {(expiryAlerts.items || []).map((batch, idx) => {
                const urgency = batch.urgency || '7_days';
                let variant: 'error' | 'warning' | 'info' = 'warning';
                if (urgency === '1_day') variant = 'error';
                if (urgency === '3_days') variant = 'warning';
                if (urgency === '7_days') variant = 'info';

                return (
                  <div key={batch.id || idx} className={styles.feedItem}>
                    <div className={styles.feedItemInfo}>
                      <span className={styles.feedItemName}>Batch #{batch.batch_number}</span>
                      <span className={styles.feedItemMeta}>
                        Expiry: {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'} ({batch.days_until_expiry ?? 0} days left)
                      </span>
                    </div>
                    <Badge variant={variant} icon={<Clock size={12} />}>
                      {batch.days_until_expiry <= 1 ? 'Expires Tomorrow' : `${batch.days_until_expiry} Days`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* 4. Recent Sales Table */}
      <div className={styles.salesSection}>
        <Card title="Recent Sales Transactions" subtitle="Latest POS bills generated">
          {isLoading ? (
            <Skeleton height={180} borderRadius="8px" />
          ) : recentSales.length === 0 ? (
            <EmptyState title="No Recent Sales" description="Generated POS bills will appear here." />
          ) : (
            <Table
              columns={salesColumns}
              data={recentSales}
              keyExtractor={(s) => s.id}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
