import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { Button, Card, FormField, Input } from '../design-system';
import { useAuth } from '../features/auth/useAuth';
import styles from './LoginPage.module.css';

interface FromState {
  from?: Location;
}

export function LoginPage() {
  const { login, isAuthenticating, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as FromState | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('developer@acme.test');
  const [password, setPassword] = useState('password');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await login({ email, password });
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className={styles.page}>
      <Card
        title="Sign in"
        description="Access your organization’s developer portal."
        className={styles.card}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <FormField label="Email" required>
            {(control) => (
              <Input
                {...control}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </FormField>

          <FormField label="Password" required>
            {(control) => (
              <Input
                {...control}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </FormField>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={isAuthenticating}>
            Sign in
          </Button>
        </form>

        <div className={styles.hint}>
          <p className={styles.hintTitle}>Demo accounts (password: password)</p>
          <ul className={styles.hintList}>
            <li>
              <code>developer@acme.test</code> — can create apps
            </li>
            <li>
              <code>viewer@acme.test</code> — read-only (authorization demo)
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
