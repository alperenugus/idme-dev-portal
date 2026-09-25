import type { Dispatch } from 'react';
import { Button, Input } from '../../../../design-system';
import { validateRedirectUri, validateRedirectUris } from '../../validation';
import type { WizardAction, WizardDraft } from '../../wizardState';
import styles from './Steps.module.css';

interface RedirectUrisStepProps {
  draft: WizardDraft;
  dispatch: Dispatch<WizardAction>;
  showErrors: boolean;
}

export function RedirectUrisStep({
  draft,
  dispatch,
  showErrors,
}: RedirectUrisStepProps) {
  const listError = showErrors ? validateRedirectUris(draft.redirectUris) : null;

  return (
    <div className={styles.stack}>
      <p className={styles.help}>
        ID.me redirects back to one of these URIs with the authorization code.
        Must be <code>https</code> (except <code>http://localhost</code> for
        development).
      </p>

      <div className={styles.uriList}>
        {draft.redirectUris.map((uri, index) => {
          const rowError =
            showErrors && uri.trim().length > 0
              ? validateRedirectUri(uri)
              : null;
          return (
            <div key={index} className={styles.uriRow}>
              <div className={styles.uriInput}>
                <Input
                  aria-label={`Redirect URI ${index + 1}`}
                  value={uri}
                  invalid={Boolean(rowError)}
                  placeholder="https://app.example.com/auth/idme/callback"
                  onChange={(e) =>
                    dispatch({
                      type: 'updateRedirectUri',
                      index,
                      value: e.target.value,
                    })
                  }
                />
                {rowError && (
                  <span className={styles.rowError} role="alert">
                    {rowError}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Remove redirect URI ${index + 1}`}
                disabled={draft.redirectUris.length === 1 && uri.trim() === ''}
                onClick={() => dispatch({ type: 'removeRedirectUri', index })}
              >
                Remove
              </Button>
            </div>
          );
        })}
      </div>

      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch({ type: 'addRedirectUri' })}
        >
          + Add another URI
        </Button>
      </div>

      {listError && (
        <p className={styles.stepError} role="alert">
          {listError}
        </p>
      )}
    </div>
  );
}
