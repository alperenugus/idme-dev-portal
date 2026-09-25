import type { Dispatch } from 'react';
import { FormField, Input, Textarea } from '../../../../design-system';
import { cx } from '../../../../design-system/utils/cx';
import {
  DESCRIPTION_MAX,
  validateDescription,
  validateName,
} from '../../validation';
import type { WizardAction, WizardDraft } from '../../wizardState';
import styles from './Steps.module.css';

interface DetailsStepProps {
  draft: WizardDraft;
  dispatch: Dispatch<WizardAction>;
  showErrors: boolean;
}

export function DetailsStep({ draft, dispatch, showErrors }: DetailsStepProps) {
  const nameError = showErrors ? validateName(draft.name) : null;
  const descriptionError = showErrors
    ? validateDescription(draft.description)
    : null;

  return (
    <div className={styles.stack}>
      <FormField
        label="Application name"
        hint="Shown to users on the ID.me consent screen."
        error={nameError}
        required
      >
        {(control) => (
          <Input
            {...control}
            invalid={Boolean(nameError)}
            value={draft.name}
            placeholder="Acme Veterans Discount"
            maxLength={80}
            onChange={(e) =>
              dispatch({ type: 'setName', value: e.target.value })
            }
          />
        )}
      </FormField>

      <FormField
        label="Description"
        hint="Optional. Helps your team recognize this application."
        error={descriptionError}
      >
        {(control) => (
          <>
            <Textarea
              {...control}
              invalid={Boolean(descriptionError)}
              value={draft.description}
              placeholder="What this integration does…"
              onChange={(e) =>
                dispatch({ type: 'setDescription', value: e.target.value })
              }
            />
            <span className={styles.counter}>
              {draft.description.length}/{DESCRIPTION_MAX}
            </span>
          </>
        )}
      </FormField>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Environment</legend>
        <div className={styles.segmented} role="radiogroup" aria-label="Environment">
          {(['sandbox', 'production'] as const).map((env) => (
            <label
              key={env}
              className={cx(
                styles.segment,
                draft.environment === env && styles.segmentActive,
              )}
            >
              <input
                type="radio"
                name="environment"
                value={env}
                className={styles.segmentInput}
                checked={draft.environment === env}
                onChange={() => dispatch({ type: 'setEnvironment', value: env })}
              />
              <span className={styles.segmentLabel}>
                {env === 'sandbox' ? 'Sandbox' : 'Production'}
              </span>
              <span className={styles.segmentHint}>
                {env === 'sandbox'
                  ? 'Test with simulated identities'
                  : 'Live users (requires review)'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
