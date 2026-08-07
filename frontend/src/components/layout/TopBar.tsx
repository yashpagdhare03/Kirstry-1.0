import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styles from './TopBar.module.css';

const titleMap: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/dashboard': 'Dashboard Overview',
  '/billing': 'POS Billing & Invoicing',
  '/products': 'Products Catalog',
  '/inventory': 'Inventory & Stock Control',
  '/khata': 'Digital Khata Credit Ledger',
  '/suppliers': 'Supplier & Purchase Orders',
  '/analytics': 'Sales Reports & Analytics',
  '/settings': 'Store Settings',
};

export interface TopBarProps {
  isCollapsed?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ isCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const pageTitle = titleMap[location.pathname] || 'Kirstry POS';

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await api.get<{ unread_count: number }>('/alerts/unread-count');
        if (res.success && res.data) {
          setUnreadCount(res.data.unread_count);
        }
      } catch (err) {
        // Silently handle backend unread count error
      }
    }
    fetchUnreadCount();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'KP';
  };

  return (
    <header className={`${styles.topBar} ${isCollapsed ? styles.collapsed : ''}`}>
      <h1 className={styles.pageTitle}>{pageTitle}</h1>

      <div className={styles.actions}>
        {/* Notification Bell */}
        <button
          className={styles.iconBtn}
          onClick={() => navigate('/alerts')}
          title="Notifications & Expiry Alerts"
          aria-label="Alerts"
        >
          <Bell size={20} strokeWidth={1.5} />
          {unreadCount > 0 && <span className={styles.badge} />}
        </button>

        {/* User Profile Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className={styles.userMenuTrigger} aria-label="User Profile">
              <div className={styles.avatar}>{getInitials(user?.name, user?.email)}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Store Owner'}</span>
                <span className={styles.storeName}>Active Store</span>
              </div>
              <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content className={styles.dropdownContent} align="end" sideOffset={6}>
              <DropdownMenu.Item className={styles.dropdownItem} onClick={() => navigate('/settings')}>
                <User size={16} strokeWidth={1.5} />
                <span>Account Profile</span>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className={styles.dropdownSeparator} />
              <DropdownMenu.Item
                className={styles.dropdownItem}
                style={{ color: 'var(--state-error)' }}
                onClick={handleLogout}
              >
                <LogOut size={16} strokeWidth={1.5} />
                <span>Logout Session</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};
