import { cx } from '../../utils/cx';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  'aria-hidden'?: boolean;
}

export function Spinner({
  size = 'md',
  label = 'Loading',
  className,
  'aria-hidden': ariaHidden,
}: SpinnerProps) {
  return (
    <span
      className={cx(styles.spinner, styles[size], className)}
      role={ariaHidden ? undefined : 'status'}
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaHidden ? undefined : label}
    />
  );
}
