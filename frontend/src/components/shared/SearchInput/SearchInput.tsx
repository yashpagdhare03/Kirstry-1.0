import React, { type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchInput.module.css';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  return (
    <div className={styles.container}>
      <span className={styles.searchIcon}>
        <Search size={18} strokeWidth={1.5} />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${className}`}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className={styles.clearButton}
          aria-label="Clear search"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
};
