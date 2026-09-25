import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.can('app:read')).toBe(false);
  });

  it('logs in a developer and exposes permissions', async () => {
    const { result } = renderHook(() => useAuth());

    let ok = false;
    await act(async () => {
      ok = await result.current.login({
        email: 'developer@acme.test',
        password: 'password',
      });
    });

    expect(ok).toBe(true);
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user?.name).toBe('Dana Developer');
    expect(result.current.can('app:create')).toBe(true);
    expect(result.current.canAll(['app:read', 'app:create'])).toBe(true);
    expect(result.current.can('org:manage')).toBe(false);
  });

  it('surfaces an error and returns false on bad credentials', async () => {
    const { result } = renderHook(() => useAuth());

    let ok = true;
    await act(async () => {
      ok = await result.current.login({
        email: 'developer@acme.test',
        password: 'nope',
      });
    });

    expect(ok).toBe(false);
    await waitFor(() => expect(result.current.error).toMatch(/Invalid/));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logs out and clears the session', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login({
        email: 'developer@acme.test',
        password: 'password',
      });
    });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
