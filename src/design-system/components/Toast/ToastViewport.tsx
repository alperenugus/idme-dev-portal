import { useEffect } from 'react';
import { useUIStore, type Toast } from '../../../store/uiStore';
import { cx } from '../../utils/cx';
import styles from './ToastViewport.module.css';

const toneClass: Record<Toast['tone'], string | undefined> = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useUIStore((s) => s.dismiss);

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div className={cx(styles.toast, toneClass[toast.tone])} role="status">
      <div className={styles.content}>
        <p className={styles.title}>{toast.title}</p>
        {toast.message && <p className={styles.message}>{toast.message}</p>}
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

/** Renders active toasts in a fixed, screen-reader-friendly region. */
export function ToastViewport() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div className={styles.viewport} aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
