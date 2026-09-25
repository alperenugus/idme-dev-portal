import { useId, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './FormField.module.css';

export interface FieldControlProps {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
}

export interface FormFieldProps {
  label: ReactNode;
  /** Helper text shown below the control when there is no error. */
  hint?: ReactNode;
  /** Error message; when present it replaces the hint and marks the field invalid. */
  error?: ReactNode;
  required?: boolean;
  className?: string;
  /**
   * Render-prop that receives the wiring props to spread onto the control, so
   * label/description/invalid state stay correctly associated for a11y.
   */
  children: (control: FieldControlProps) => ReactNode;
}

export function FormField({
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cx(styles.field, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
