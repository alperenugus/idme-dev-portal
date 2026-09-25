import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  );
}
