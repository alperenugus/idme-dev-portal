import { useState } from 'react';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import styles from './CopyField.module.css';

export interface CopyFieldProps {
  label: string;
  value: string;
  /** When true, the value is masked until revealed (for secrets). */
  secret?: boolean;
  className?: string;
  /** Injectable for tests / non-secure contexts where navigator.clipboard is absent. */
  onCopy?: (value: string) => Promise<void> | void;
}

async function defaultCopy(value: string): Promise<void> {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  throw new Error('Clipboard API unavailable');
}

export function CopyField({
  label,
  value,
  secret = false,
  className,
  onCopy = defaultCopy,
}: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(!secret);
  const [error, setError] = useState(false);

  const display = revealed ? value : '•'.repeat(Math.min(value.length, 40));

  const handleCopy = async () => {
    try {
      await onCopy(value);
      setError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(true);
    }
  };

  return (
    <div className={cx(styles.root, className)}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <code className={styles.value} data-masked={!revealed || undefined}>
          {display}
        </code>
        {secret && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
          >
            {revealed ? 'Hide' : 'Reveal'}
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      {error && (
        <span className={styles.error} role="alert">
          Couldn’t copy — select the value and copy manually.
        </span>
      )}
    </div>
  );
}
