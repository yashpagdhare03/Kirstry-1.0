import React, { type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isMono?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  isMono = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const inputClasses = [
    styles.input,
    isMono ? styles.isMono : '',
    error ? styles.hasError : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input id={inputId} className={inputClasses} {...props} />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
      {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
};
