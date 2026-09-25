import { Badge } from '../../../../design-system';
import { getScope, scopesRequireReview } from '../../scopes';
import { toCreateInput, type WizardDraft } from '../../wizardState';
import styles from './Steps.module.css';

interface ReviewStepProps {
  draft: WizardDraft;
}

export function ReviewStep({ draft }: ReviewStepProps) {
  const input = toCreateInput(draft);
  const needsReview = scopesRequireReview(input.scopes);

  return (
    <div className={styles.stack}>
      <dl className={styles.summary}>
        <div className={styles.summaryRow}>
          <dt>Name</dt>
          <dd>{input.name}</dd>
        </div>
        {input.description && (
          <div className={styles.summaryRow}>
            <dt>Description</dt>
            <dd>{input.description}</dd>
          </div>
        )}
        <div className={styles.summaryRow}>
          <dt>Environment</dt>
          <dd className={styles.capitalize}>{input.environment}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Redirect URIs</dt>
          <dd>
            <ul className={styles.summaryList}>
              {input.redirectUris.map((uri) => (
                <li key={uri}>
                  <code>{uri}</code>
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Scopes</dt>
          <dd className={styles.scopeBadges}>
            {input.scopes.map((id) => {
              const scope = getScope(id);
              return (
                <Badge
                  key={id}
                  tone={scope?.requiresReview ? 'warning' : 'brand'}
                >
                  {scope?.label ?? id}
                </Badge>
              );
            })}
          </dd>
        </div>
      </dl>

      <div className={styles.callout} role="note">
        {needsReview
          ? 'On create, your app enters review for the requested community scopes. Sandbox credentials are available immediately.'
          : 'On create, your app is active in sandbox immediately. Your client secret is shown once — store it securely.'}
      </div>
    </div>
  );
}
