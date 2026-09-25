import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { permissionsForRoles, type Permission } from './permissions';
import type { AuthStatus, Session } from './types';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  error: string | null;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
  setSession: (session: Session) => void;
  clearSession: () => void;
}

/**
 * Pure auth state. Deliberately imports no services or API client, so it can be
 * a dependency of the API client (for token injection + 401 handling) without a
 * circular import. Orchestration (login/logout side effects) lives in hooks.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: 'idle',
      session: null,
      error: null,
      setStatus: (status) => set({ status }),
      setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
      setSession: (session) =>
        set({ session, status: 'authenticated', error: null }),
      clearSession: () => set({ session: null, status: 'idle', error: null }),
    }),
    {
      name: 'devportal.auth',
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        if (state?.session) state.status = 'authenticated';
      },
    },
  ),
);

// --- Selectors (usable outside React, e.g. by the API client) ---

export function getAuthToken(): string | null {
  const { session } = useAuthStore.getState();
  if (!session) return null;
  if (session.expiresAt <= Date.now()) return null;
  return session.token;
}

export function selectPermissions(session: Session | null): Set<Permission> {
  if (!session) return new Set();
  return permissionsForRoles(session.user.roles);
}
