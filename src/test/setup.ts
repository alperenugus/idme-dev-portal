import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { server } from './mocks/server';
import { resetApplications } from './mocks/data';
import { useAuthStore } from '../features/auth/authStore';
import { useUIStore } from '../store/uiStore';
import { useThemeStore } from '../design-system/theme/themeStore';

// jsdom doesn't implement matchMedia — the theme system depends on it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  // Isolate global state between tests.
  localStorage.clear();
  useAuthStore.setState({ session: null, status: 'idle', error: null });
  useUIStore.setState({ toasts: [] });
  useThemeStore.setState({ mode: 'system' });
  resetApplications();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
