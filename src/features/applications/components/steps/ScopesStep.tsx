import type { Dispatch } from 'react';
import { Badge, Checkbox } from '../../../../design-system';
import { COMMUNITY_SCOPES, IDENTITY_SCOPES, scopesRequireReview } from '../../scopes';
import { validateScopes } from '../../validation';
import type { WizardAction, WizardDraft } from '../../wizardState';
import type { Scope } from '../../types';
import styles from './Steps.module.css';

interface ScopesStepProps {
  draft: WizardDraft;
  dispatch: Dispatch<WizardAction>;
  showErrors: boolean;
}

function ScopeGroup({
  title,
  scopes,
  selected,
  onToggle,
}: {
  title: string;
  scopes: Scope[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className={styles.scopeGroup}>
      <h3 className={styles.scopeGroupTitle}>{title}</h3>
      <div className={styles.scopeList}>
        {scopes.map((scope) => (
          <div key={scope.id} className={styles.scopeItem}>
            <Checkbox
              checked={selected.includes(scope.id)}
              onChange={() => onToggle(scope.id)}
              label={
                <span className={styles.scopeLabel}>
                  {scope.label}
                  {scope.requiresReview && <Badge tone="warning">Review</Badge>}
                </span>
              }
              description={scope.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScopesStep({ draft, dispatch, showErrors }: ScopesStepProps) {
  const scopeError = showErrors ? validateScopes(draft.scopes) : null;
  const needsReview = scopesRequireReview(draft.scopes);
  const onToggle = (id: string) => dispatch({ type: 'toggleScope', id });

  return (
    <div className={styles.stack}>
      <ScopeGroup
        title="Identity"
        scopes={IDENTITY_SCOPES}
        selected={draft.scopes}
        onToggle={onToggle}
      />
      <ScopeGroup
        title="Community verification"
        scopes={COMMUNITY_SCOPES}
        selected={draft.scopes}
        onToggle={onToggle}
      />

      {needsReview && (
        <div className={styles.callout} role="note">
          <strong>Heads up:</strong> community scopes require ID.me review before
          production access is granted. You can build against sandbox immediately.
        </div>
      )}

      {scopeError && (
        <p className={styles.stepError} role="alert">
          {scopeError}
        </p>
      )}
    </div>
  );
}
