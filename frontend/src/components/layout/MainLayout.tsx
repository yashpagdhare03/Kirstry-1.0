import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <TopBar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
