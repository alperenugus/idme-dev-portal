import { Badge, Button, CopyField } from '../../../design-system';
import type { ApplicationWithSecret } from '../types';
import type { BadgeTone } from '../../../design-system';
import styles from './CreateApplicationWizard.module.css';

const STATUS_META: Record<
  ApplicationWithSecret['status'],
  { tone: BadgeTone; label: string }
> = {
  active: { tone: 'success', label: 'Active (sandbox)' },
  in_review: { tone: 'warning', label: 'In review' },
  approved: { tone: 'success', label: 'Approved' },
  rejected: { tone: 'danger', label: 'Rejected' },
};

interface CredentialsPanelProps {
  application: ApplicationWithSecret;
  onCreateAnother: () => void;
}

export function CredentialsPanel({
  application,
  onCreateAnother,
}: CredentialsPanelProps) {
  const status = STATUS_META[application.status];

  return (
    <div className={styles.success}>
      <div className={styles.successHeader}>
        <div className={styles.successIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path
              d="M20 6 9 17l-5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h2 className={styles.successTitle}>{application.name} is ready</h2>
          <p className={styles.successSubtitle}>
            Store your client secret now — it won’t be shown again.
          </p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className={styles.credentials}>
        <CopyField label="Client ID" value={application.clientId} />
        <CopyField label="Client secret" value={application.clientSecret} secret />
      </div>

      <div className={styles.dangerNote} role="note">
        Treat the client secret like a password. Never expose it in browser or
        mobile code — use it only from your backend.
      </div>

      <div className={styles.successActions}>
        <Button variant="secondary" onClick={onCreateAnother}>
          Create another
        </Button>
      </div>
    </div>
  );
}
