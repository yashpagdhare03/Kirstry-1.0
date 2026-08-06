import React, { useState, useEffect } from 'react';
import { analyticsService, type SlowMovingItem } from '../../services/analytics';
import { Card, Skeleton } from '../../components/shared';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AlertTriangle, Hourglass } from 'lucide-react';
import styles from './AnalyticsPages.module.css';

interface SlowMovingPageProps {
  days: number;
}

export const SlowMovingPage: React.FC<SlowMovingPageProps> = ({ days }) => {
  const [data, setData] = useState<SlowMovingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await analyticsService.getSlowMoving({ limit: 10, days });
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [days]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Alert Header */}
      <Card style={{ borderLeft: '4px solid var(--state-warning)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={24} style={{ color: 'var(--state-warning)' }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Dead Stock & Slow-Moving Products Risk Report
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Items with low sales velocity tying up working capital over the past {days} days.
            </p>
          </div>
        </div>
      </Card>

      {/* Chart Card */}
      <div className={styles.chartCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Hourglass size={20} style={{ color: 'var(--state-warning)' }} />
          <h2 className={styles.chartTitle}>Current Stock vs Units Sold (Slow-Moving)</h2>
        </div>

        {loading ? (
          <Skeleton height={320} />
        ) : data.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No slow moving items recorded for this period
          </div>
        ) : (
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
                <XAxis
                  dataKey="product_name"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface-alt)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="current_stock" fill="#EF4444" radius={[4, 4, 0, 0]} name="Current Stock" />
                <Bar dataKey="total_quantity_sold" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Dead Stock Table */}
      <Card>
        {loading ? (
          <Skeleton height={200} />
        ) : (
          <div className="table-responsive-container">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Current Stock</th>
                  <th>Units Sold ({days}d)</th>
                  <th>Days Idle</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.product_id || idx}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{item.product_name}</strong>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--state-error)' }}>
                        {item.current_stock}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                        {item.total_quantity_sold}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ color: 'var(--state-warning)' }}>
                        {item.days_since_last_sale !== undefined ? `${item.days_since_last_sale} Days` : 'No Recent Sales'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SlowMovingPage;
