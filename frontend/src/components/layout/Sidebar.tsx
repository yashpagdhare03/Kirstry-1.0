import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Package,
  Boxes,
  BookOpen,
  Truck,
  TrendingUp,
  Settings,
  Store,
  PanelLeftClose,
} from 'lucide-react';
import styles from './Sidebar.module.css';

export interface NavRoute {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export const navRoutes: NavRoute[] = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} strokeWidth={1.5} /> },
  { path: '/billing', label: 'POS Billing', icon: <Receipt size={20} strokeWidth={1.5} /> },
  { path: '/products', label: 'Products', icon: <Package size={20} strokeWidth={1.5} /> },
  { path: '/inventory', label: 'Inventory', icon: <Boxes size={20} strokeWidth={1.5} /> },
  { path: '/khata', label: 'Digital Khata', icon: <BookOpen size={20} strokeWidth={1.5} /> },
  { path: '/suppliers', label: 'Suppliers & POs', icon: <Truck size={20} strokeWidth={1.5} /> },
  { path: '/analytics', label: 'Analytics', icon: <TrendingUp size={20} strokeWidth={1.5} /> },
  { path: '/settings', label: 'Settings', icon: <Settings size={20} strokeWidth={1.5} /> },
];

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.brand}>
        <div className={styles.brandLeft}>
          <div className={styles.brandIcon}>
            <Store size={18} strokeWidth={2} />
          </div>
          <div className={styles.brandInfo}>
            <span className={styles.brandTitle}>Kirstry POS</span>
            <span className={styles.brandSubtitle}>Kirana Store Manager</span>
          </div>
        </div>

        {onToggleCollapse && (
          <button
            className={styles.toggleBtn}
            onClick={onToggleCollapse}
            title="Close Sidebar"
            aria-label="Close Sidebar"
          >
            <PanelLeftClose size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {navRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            end={route.path === '/'}
          >
            <span className={styles.navIcon}>{route.icon}</span>
            <span className={styles.navLabel}>{route.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        Kirstry v1.0 &bull; Local Engine
      </div>
    </aside>
  );
};
