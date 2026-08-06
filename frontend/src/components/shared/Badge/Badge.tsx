import React, { type ReactNode, type CSSProperties } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  icon,
  className = '',
  style,
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} style={style}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
};
