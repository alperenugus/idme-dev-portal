import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  padded?: boolean;
}

export function Card({
  title,
  description,
  footer,
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div className={cx(styles.card, className)} {...rest}>
      {(title || description) && (
        <header className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {description && <p className={styles.description}>{description}</p>}
        </header>
      )}
      <div className={cx(padded ? styles.body : styles.bodyFlush)}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
}
