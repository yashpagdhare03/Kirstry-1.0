import React, { useState } from 'react';
import { FastMovingPage } from './analytics/FastMovingPage';
import { SlowMovingPage } from './analytics/SlowMovingPage';
import { SalesTrendsPage } from './analytics/SalesTrendsPage';
import { InventoryValuePage } from './analytics/InventoryValuePage';
import styles from './analytics/AnalyticsPages.module.css';

type TabType = 'fast-moving' | 'slow-moving' | 'sales-trends' | 'inventory-value';
type PeriodType = 7 | 30 | 90;

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('fast-moving');
  const [period, setPeriod] = useState<PeriodType>(30);

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Store Analytics & Business Intelligence</h1>
          <p className={styles.subtitle}>
            Product movement trends, dead stock identification, revenue forecasts, and inventory valuation
          </p>
        </div>
      </div>

      {/* Controls Bar: Navigation Tabs & Period Selector */}
      <div className={styles.controlsBar}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'fast-moving' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('fast-moving')}
          >
            🔥 Fast Moving Items
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'slow-moving' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('slow-moving')}
          >
            ⏳ Slow Moving (Dead Stock)
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'sales-trends' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('sales-trends')}
          >
            📈 Sales Revenue Trends
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'inventory-value' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('inventory-value')}
          >
            📊 Inventory Category Value
          </button>
        </div>

        {/* Period Chips (Only applicable for time-based tabs) */}
        {activeTab !== 'inventory-value' && (
          <div className={styles.periodContainer}>
            {([7, 30, 90] as PeriodType[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.periodChip} ${period === p ? styles.periodChipActive : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p}d
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Tab View */}
      {activeTab === 'fast-moving' && <FastMovingPage days={period} />}
      {activeTab === 'slow-moving' && <SlowMovingPage days={period} />}
      {activeTab === 'sales-trends' && <SalesTrendsPage days={period} />}
      {activeTab === 'inventory-value' && <InventoryValuePage />}
    </div>
  );
};

export default AnalyticsPage;
