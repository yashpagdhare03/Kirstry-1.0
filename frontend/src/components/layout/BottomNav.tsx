import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  BookOpen,
  Grid,
  Package,
  Truck,
  TrendingUp,
  Settings,
} from 'lucide-react';
import styles from './BottomNav.module.css';

export const BottomNav: React.FC = () => {
  return (
    <nav className={styles.bottomNav}>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${styles.tabItem} ${isActive ? styles.active : ''}`
        }
        end
      >
        <LayoutDashboard size={20} strokeWidth={1.5} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/billing"
        className={({ isActive }) =>
          `${styles.tabItem} ${isActive ? styles.active : ''}`
        }
      >
        <Receipt size={20} strokeWidth={1.5} />
        <span>Billing</span>
      </NavLink>

      <NavLink
        to="/inventory"
        className={({ isActive }) =>
          `${styles.tabItem} ${isActive ? styles.active : ''}`
        }
      >
        <Boxes size={20} strokeWidth={1.5} />
        <span>Stock</span>
      </NavLink>

      <NavLink
        to="/khata"
        className={({ isActive }) =>
          `${styles.tabItem} ${isActive ? styles.active : ''}`
        }
      >
        <BookOpen size={20} strokeWidth={1.5} />
        <span>Khata</span>
      </NavLink>

      {/* More Popover for remaining modules */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className={styles.tabItem} aria-label="More navigation options">
            <Grid size={20} strokeWidth={1.5} />
            <span>More</span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content className={styles.morePopover} side="top" align="end" sideOffset={12}>
            <NavLink to="/products" className={styles.popoverItem}>
              <Package size={18} strokeWidth={1.5} />
              <span>Products Catalog</span>
            </NavLink>
            <NavLink to="/suppliers" className={styles.popoverItem}>
              <Truck size={18} strokeWidth={1.5} />
              <span>Suppliers & POs</span>
            </NavLink>
            <NavLink to="/analytics" className={styles.popoverItem}>
              <TrendingUp size={18} strokeWidth={1.5} />
              <span>Reports & Analytics</span>
            </NavLink>
            <NavLink to="/settings" className={styles.popoverItem}>
              <Settings size={18} strokeWidth={1.5} />
              <span>Store Settings</span>
            </NavLink>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </nav>
  );
};
