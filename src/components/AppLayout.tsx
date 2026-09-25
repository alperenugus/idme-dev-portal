import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../design-system';
import { useAuth } from '../features/auth/useAuth';
import { ThemeToggle } from './ThemeToggle';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            id
          </span>
          <span className={styles.brandText}>Developer Portal</span>
        </div>

        <div className={styles.actions}>
          <ThemeToggle />
          {user && (
            <div className={styles.user}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userOrg}>{user.organizationName}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
