import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a spinner and disables the button. */
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leadingIcon,
    disabled,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" aria-hidden />
      ) : (
        leadingIcon && <span className={styles.icon}>{leadingIcon}</span>
      )}
      <span className={styles.label}>{children}</span>
    </button>
  );
});
