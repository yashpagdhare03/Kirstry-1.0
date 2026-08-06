import React, { useState, useEffect } from 'react';
import { analyticsService, type SalesTrendData } from '../../services/analytics';
import { Card, Skeleton } from '../../components/shared';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import styles from './AnalyticsPages.module.css';

interface SalesTrendsPageProps {
  days: number;
}

export const SalesTrendsPage: React.FC<SalesTrendsPageProps> = ({ days }) => {
  const [data, setData] = useState<SalesTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await analyticsService.getSalesTrends({ timeframe: 'daily', days });
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

  const totalPeriodRevenue = data.reduce((acc, d) => acc + (d.revenue || 0), 0);
  const totalOrdersCount = data.reduce((acc, d) => acc + (d.orders_count || 0), 0);
  const avgDailyRevenue = data.length > 0 ? totalPeriodRevenue / data.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid var(--state-success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <DollarSign size={28} style={{ color: 'var(--state-success)' }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Period Total Revenue</div>
              <div className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{totalPeriodRevenue.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingCart size={28} style={{ color: '#3B82F6' }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Period Orders Count</div>
              <div className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {totalOrdersCount} Bills
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #A855F7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp size={28} style={{ color: '#A855F7' }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Average Daily Sales</div>
              <div className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{avgDailyRevenue.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Area Chart Card */}
      <div className={styles.chartCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} style={{ color: 'var(--state-success)' }} />
          <h2 className={styles.chartTitle}>Daily Sales Revenue Trend (₹)</h2>
        </div>

        {loading ? (
          <Skeleton height={320} />
        ) : data.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No sales trend data recorded for this timeframe
          </div>
        ) : (
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
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
                    name === 'revenue' ? `₹${Number(val).toFixed(2)}` : `${val} Bills`,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTrendsPage;
