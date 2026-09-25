import { cx } from '../../utils/cx';
import styles from './Stepper.module.css';

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Zero-based index of the active step. */
  activeIndex: number;
  className?: string;
}

export function Stepper({ steps, activeIndex, className }: StepperProps) {
  return (
    <ol className={cx(styles.stepper, className)} aria-label="Progress">
      {steps.map((step, index) => {
        const state =
          index < activeIndex
            ? 'complete'
            : index === activeIndex
              ? 'current'
              : 'upcoming';
        return (
          <li
            key={step.id}
            className={cx(styles.step, styles[state])}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className={styles.marker}>
              {state === 'complete' ? (
                <svg viewBox="0 0 16 16" className={styles.check} aria-hidden="true">
                  <path
                    d="M13 4.5 6.5 11 3 7.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <span className={styles.label}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
