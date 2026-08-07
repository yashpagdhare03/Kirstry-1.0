import React, { useState } from 'react';
import { StoreProfileTab } from './settings/StoreProfileTab';
import { StaffManagementTab } from './settings/StaffManagementTab';
import { AccountTab } from './settings/AccountTab';
import styles from './settings/SettingsPages.module.css';

type TabType = 'store' | 'staff' | 'account';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('store');
  const [userRole, setUserRole] = useState<'owner' | 'staff'>('owner');

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Store Settings & Account Management</h1>
          <p className={styles.subtitle}>
            Business profile settings, GSTIN tax details, staff permissions, and account preferences
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className={styles.tabsContainer}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'store' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('store')}
        >
          🏪 Store Profile
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'staff' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          👥 Staff Management
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'account' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('account')}
        >
          👤 My Account ({userRole.toUpperCase()})
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'store' && <StoreProfileTab isOwner={userRole === 'owner'} />}
      {activeTab === 'staff' && <StaffManagementTab isOwner={userRole === 'owner'} />}
      {activeTab === 'account' && (
        <AccountTab userRole={userRole} onRoleChange={(role) => setUserRole(role)} />
      )}
    </div>
  );
};

export default SettingsPage;
