import { beforeEach, describe, expect, it } from 'vitest';
import {
  getAuthToken,
  selectPermissions,
  useAuthStore,
} from './authStore';
import type { Session } from './types';

function sessionFixture(overrides: Partial<Session> = {}): Session {
  return {
    token: 'tok_abc',
    expiresAt: Date.now() + 60_000,
    user: {
      id: 'u1',
      name: 'Dev',
      email: 'dev@acme.test',
      organizationId: 'o1',
      organizationName: 'Acme',
      roles: ['developer'],
    },
    ...overrides,
  };
}

describe('authStore', () => {
  beforeEach(() =>
    useAuthStore.setState({ session: null, status: 'idle', error: null }),
  );

  it('sets and clears a session', () => {
    useAuthStore.getState().setSession(sessionFixture());
    expect(useAuthStore.getState().status).toBe('authenticated');
    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().status).toBe('idle');
  });

  it('setError moves to error status and setError(null) back to idle', () => {
    useAuthStore.getState().setError('bad');
    expect(useAuthStore.getState().status).toBe('error');
    expect(useAuthStore.getState().error).toBe('bad');
    useAuthStore.getState().setError(null);
    expect(useAuthStore.getState().status).toBe('idle');
  });

  it('setStatus updates status', () => {
    useAuthStore.getState().setStatus('authenticating');
    expect(useAuthStore.getState().status).toBe('authenticating');
  });
});

describe('getAuthToken', () => {
  beforeEach(() =>
    useAuthStore.setState({ session: null, status: 'idle', error: null }),
  );

  it('returns null with no session', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('returns the token for a live session', () => {
    useAuthStore.getState().setSession(sessionFixture());
    expect(getAuthToken()).toBe('tok_abc');
  });

  it('returns null for an expired session', () => {
    useAuthStore.getState().setSession(
      sessionFixture({ expiresAt: Date.now() - 1000 }),
    );
    expect(getAuthToken()).toBeNull();
  });
});

describe('selectPermissions', () => {
  it('returns an empty set for no session', () => {
    expect(selectPermissions(null).size).toBe(0);
  });
  it('derives permissions from the session roles', () => {
    const perms = selectPermissions(sessionFixture());
    expect(perms.has('app:create')).toBe(true);
  });
});
