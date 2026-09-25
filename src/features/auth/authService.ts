import { apiClient } from '../../lib/api/apiClient';
import type { LoginCredentials, Session } from './types';

/**
 * Auth network operations. Pure I/O — no state. Callers (hooks) commit the
 * result to the auth store.
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<Session> {
    return apiClient.post<Session>('/auth/login', credentials);
  },

  async logout(): Promise<void> {
    // Best-effort: a failed logout must never trap the user in the app.
    try {
      await apiClient.post<void>('/auth/logout');
    } catch {
      /* ignore — local session is cleared regardless */
    }
  },
};
