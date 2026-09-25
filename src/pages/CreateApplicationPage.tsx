import { Card } from '../design-system';
import { RequirePermission } from '../features/auth/RequirePermission';
import { CreateApplicationWizard } from '../features/applications/components/CreateApplicationWizard';
import styles from './CreateApplicationPage.module.css';

function NoAccess() {
  return (
    <Card title="You don’t have access">
      <p className={styles.noAccess}>
        Creating applications requires the <code>app:create</code> permission.
        Ask an organization admin to grant you the Developer role.
      </p>
    </Card>
  );
}

export function CreateApplicationPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Applications</p>
        <h1 className={styles.title}>Create a new application</h1>
        <p className={styles.subtitle}>
          Register an OAuth 2.0 / OpenID Connect client to integrate ID.me
          identity and community verification.
        </p>
      </header>

      <RequirePermission permission="app:create" fallback={<NoAccess />}>
        <CreateApplicationWizard />
      </RequirePermission>
    </div>
  );
}
