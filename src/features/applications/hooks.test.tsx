import type { ReactNode } from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApplications, useCreateApplication } from './hooks';
import { useAuthStore } from '../auth/authStore';
import { useUIStore } from '../../store/uiStore';
import { resetApplications } from '../../test/mocks/data';
import type { Session } from '../auth/types';
import type { CreateApplicationInput } from './types';

const session: Session = {
  token: 't',
  expiresAt: Date.now() + 60_000,
  user: {
    id: 'u',
    name: 'Dev',
    email: 'dev@acme.test',
    organizationId: 'o',
    organizationName: 'Acme',
    roles: ['developer'],
  },
};

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const validInput: CreateApplicationInput = {
  name: 'Acme App',
  description: '',
  redirectUris: ['https://acme.com/cb'],
  scopes: ['openid'],
  environment: 'sandbox',
};

beforeEach(() => {
  useAuthStore.setState({ session, status: 'authenticated', error: null });
  useUIStore.setState({ toasts: [] });
});

describe('useApplications', () => {
  it('loads the applications list', async () => {
    resetApplications([
      {
        id: 'app_1',
        name: 'Seed',
        description: '',
        redirectUris: ['https://s.com/cb'],
        scopes: ['openid'],
        environment: 'sandbox',
        status: 'active',
        clientId: 'idme_1',
        createdAt: new Date().toISOString(),
      },
    ]);
    const { result } = renderHook(() => useApplications(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.name).toBe('Seed');
  });
});

describe('useCreateApplication', () => {
  it('creates an app, returns the secret, and fires a success toast', async () => {
    const { result } = renderHook(() => useCreateApplication(), {
      wrapper: wrapper(),
    });

    result.current.mutate(validInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.clientSecret).toMatch(/^secret_/);
    expect(result.current.data?.clientId).toMatch(/^idme_/);

    const toasts = useUIStore.getState().toasts;
    expect(toasts.some((t) => t.tone === 'success')).toBe(true);
  });

  it('sets in_review status when a community scope is requested', async () => {
    const { result } = renderHook(() => useCreateApplication(), {
      wrapper: wrapper(),
    });
    result.current.mutate({ ...validInput, scopes: ['openid', 'military'] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe('in_review');
  });

  it('surfaces an error toast on server validation failure', async () => {
    const { result } = renderHook(() => useCreateApplication(), {
      wrapper: wrapper(),
    });
    // Missing openid -> server responds 422
    result.current.mutate({ ...validInput, scopes: ['email'] });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('validation');
    expect(useUIStore.getState().toasts.some((t) => t.tone === 'error')).toBe(
      true,
    );
  });
});
