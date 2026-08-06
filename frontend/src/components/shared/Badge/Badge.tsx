import React, { type ReactNode } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  icon,
  className = '',
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
};
