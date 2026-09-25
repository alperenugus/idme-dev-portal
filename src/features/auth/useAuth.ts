import { useCallback } from 'react';
import { ApiError } from '../../lib/api/errors';
import { useAuthStore, selectPermissions } from './authStore';
import { authService } from './authService';
import {
  hasAllPermissions,
  hasPermission,
  type Permission,
} from './permissions';
import type { LoginCredentials } from './types';

export interface UseAuthResult {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user: import('./types').User | null;
  error: string | null;
  permissions: Set<Permission>;
  can: (permission: Permission) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

/**
 * Primary auth hook: reads reactive auth state and exposes login/logout that
 * orchestrate the service + store. `login` resolves to a boolean instead of
 * throwing, so form components can branch without try/catch.
 */
export function useAuth(): UseAuthResult {
  const session = useAuthStore((s) => s.session);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const setStatus = useAuthStore((s) => s.setStatus);
  const setError = useAuthStore((s) => s.setError);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const permissions = selectPermissions(session);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setStatus('authenticating');
      try {
        const next = await authService.login(credentials);
        setSession(next);
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Something went wrong signing in.';
        setError(message);
        return false;
      }
    },
    [setStatus, setSession, setError],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    clearSession();
  }, [clearSession]);

  return {
    isAuthenticated: status === 'authenticated' && session !== null,
    isAuthenticating: status === 'authenticating',
    user: session?.user ?? null,
    error,
    permissions,
    can: (permission) => hasPermission(permissions, permission),
    canAll: (required) => hasAllPermissions(permissions, required),
    login,
    logout,
  };
}
