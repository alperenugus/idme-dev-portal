import { getAuthToken, useAuthStore } from '../../features/auth/authStore';
import { ApiClient } from './client';

/**
 * The app-wide API client singleton. Its auth interceptor pulls the current
 * token from the auth store, and a 401 clears the session so the router's guard
 * redirects to login.
 */
export const apiClient = new ApiClient({
  getToken: () => getAuthToken(),
  onUnauthorized: () => {
    useAuthStore.getState().clearSession();
  },
});
