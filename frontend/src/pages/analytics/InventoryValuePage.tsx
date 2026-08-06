import React, { useState, useEffect } from 'react';
import { analyticsService, type CategoryValueData } from '../../services/analytics';
import { Card, Skeleton } from '../../components/shared';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, Layers } from 'lucide-react';
import styles from './AnalyticsPages.module.css';

const COLOR_PALETTE = ['#3B82F6', '#22C55E', '#F59E0B', '#A855F7', '#EC4899', '#14B8A6', '#6366F1'];

export const InventoryValuePage: React.FC = () => {
  const [data, setData] = useState<CategoryValueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await analyticsService.getInventoryValueByCategory();
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
  }, []);

  const totalStoreValuation = data.reduce((acc, c) => acc + (c.total_valuation || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Total Valuation Header */}
      <Card style={{ borderLeft: '4px solid #3B82F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Store Inventory Asset Valuation</div>
            <div className="font-mono" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{totalStoreValuation.toFixed(2)}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <strong>{data.length}</strong> Product Categories
          </div>
        </div>
      </Card>

      {/* Donut Pie Chart Card */}
      <div className={styles.chartCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieIcon size={20} style={{ color: '#3B82F6' }} />
          <h2 className={styles.chartTitle}>Category Asset Valuation Distribution</h2>
        </div>

        {loading ? (
          <Skeleton height={320} />
        ) : data.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No category valuation data available
          </div>
        ) : (
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total_valuation"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface-alt)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, 'Valuation']}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Breakdown Table */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Layers size={18} style={{ color: '#3B82F6' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Category Valuation Breakdown Table
          </h3>
        </div>

        {loading ? (
          <Skeleton height={200} />
        ) : (
          <div className="table-responsive-container">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total SKU Types</th>
                  <th>Total Stock Quantity</th>
                  <th>Category Asset Value</th>
                  <th>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((cat, idx) => {
                  const share = totalStoreValuation > 0 ? (cat.total_valuation / totalStoreValuation) * 100 : 0;
                  return (
                    <tr key={idx}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{cat.category_name}</strong>
                      </td>
                      <td>
                        <span className="font-mono">{cat.total_items} Types</span>
                      </td>
                      <td>
                        <span className="font-mono">{cat.total_stock_quantity} Units</span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontWeight: 700, color: '#3B82F6' }}>
                          ₹{(cat.total_valuation || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                          {share.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InventoryValuePage;
