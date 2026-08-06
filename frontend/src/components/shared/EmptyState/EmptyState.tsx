import React, { type ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <PackageOpen size={48} strokeWidth={1.2} />,
  action,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};
