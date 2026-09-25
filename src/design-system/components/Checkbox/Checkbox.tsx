import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Checkbox.module.css';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, description, id, className, ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descId = description ? `${inputId}-desc` : undefined;

    return (
      <label className={cx(styles.root, className)} htmlFor={inputId}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={styles.input}
          aria-describedby={descId}
          {...rest}
        />
        <span className={styles.box} aria-hidden="true">
          <svg viewBox="0 0 16 16" className={styles.check} focusable="false">
            <path
              d="M13 4.5 6.5 11 3 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className={styles.text}>
          <span className={styles.label}>{label}</span>
          {description && (
            <span id={descId} className={styles.description}>
              {description}
            </span>
          )}
        </span>
      </label>
    );
  },
);
