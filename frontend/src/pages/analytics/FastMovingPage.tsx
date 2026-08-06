import React, { useState, useEffect } from 'react';
import { analyticsService, type FastMovingItem } from '../../services/analytics';
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
import { TrendingUp, Flame } from 'lucide-react';
import styles from './AnalyticsPages.module.css';

interface FastMovingPageProps {
  days: number;
}

export const FastMovingPage: React.FC<FastMovingPageProps> = ({ days }) => {
  const [data, setData] = useState<FastMovingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await analyticsService.getFastMoving({ limit: 10, days });
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
      {/* Chart Card */}
      <div className={styles.chartCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} style={{ color: '#F59E0B' }} />
          <h2 className={styles.chartTitle}>Top 10 Fast-Selling Products (by Units Sold)</h2>
        </div>

        {loading ? (
          <Skeleton height={320} />
        ) : data.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No sales data available for this timeframe
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
                  formatter={(val: any, name?: any) => [
                    name === 'total_quantity_sold' ? `${val} Units` : `₹${Number(val).toFixed(2)}`,
                    name === 'total_quantity_sold' ? 'Qty Sold' : 'Revenue',
                  ]}
                />
                <Bar dataKey="total_quantity_sold" fill="#3B82F6" radius={[4, 4, 0, 0]} name="total_quantity_sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Sellers Table */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <TrendingUp size={18} style={{ color: 'var(--state-success)' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Fast-Moving Inventory Rank Breakdown
          </h3>
        </div>

        {loading ? (
          <Skeleton height={200} />
        ) : (
          <div className="table-responsive-container">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product Name</th>
                  <th>Quantity Sold</th>
                  <th>Generated Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.product_id || idx}>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{item.product_name}</strong>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#3B82F6' }}>
                        {item.total_quantity_sold} Units
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--state-success)' }}>
                        ₹{(item.total_revenue || 0).toFixed(2)}
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

export default FastMovingPage;
