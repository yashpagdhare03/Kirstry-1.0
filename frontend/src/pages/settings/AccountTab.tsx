import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components/shared';
import { User, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './SettingsPages.module.css';

interface AccountTabProps {
  userRole: 'owner' | 'staff';
  onRoleChange: (role: 'owner' | 'staff') => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({ userRole, onRoleChange }) => {
  const navigate = useNavigate();
  const { user, storeId, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of Kirstry POS?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
      {/* Account Profile Card */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <User size={28} />
            </div>

            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.name || user?.email?.split('@')[0] || 'Store Merchant'}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {user?.email || 'merchant@kirstrypos.com'}
              </div>
              <div style={{ marginTop: '6px' }}>
                <span
                  className={`${styles.roleBadge} ${
                    userRole === 'owner' ? styles.roleOwner : styles.roleStaff
                  }`}
                >
                  {userRole === 'owner' ? 'Store Owner (Admin)' : 'Staff Cashier'}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface-alt)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div>
              <strong>Store Tenancy ID:</strong> <span className="font-mono">{storeId || 'Default Store'}</span>
            </div>
            <div>
              <strong>Authenticated Role:</strong> {userRole === 'owner' ? 'Owner / Administrator' : 'Cashier / Staff'}
            </div>
          </div>

          {/* Dev / Testing Role Switcher */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Preview Role Permissions Mode:
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={() => onRoleChange(userRole === 'owner' ? 'staff' : 'owner')}
            >
              Switch to {userRole === 'owner' ? 'Staff Role' : 'Owner Role'}
            </Button>
          </div>

          {/* Logout Action */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              leftIcon={<LogOut size={16} />}
              onClick={handleLogout}
              style={{ color: 'var(--state-error)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            >
              Logout Session
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccountTab;
