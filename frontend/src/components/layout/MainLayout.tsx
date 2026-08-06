import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kirstry_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kirstry_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className={styles.layout}>
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      <TopBar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      <main className={`${styles.mainContent} ${isCollapsed ? styles.collapsed : ''}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
