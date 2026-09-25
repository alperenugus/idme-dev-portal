import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import { apiClient } from './apiClient';
import { useAuthStore } from '../../features/auth/authStore';
import type { Session } from '../../features/auth/types';

const session: Session = {
  token: 'tok_live',
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

describe('apiClient singleton wiring', () => {
  it('injects the current auth token from the store', async () => {
    useAuthStore.setState({ session, status: 'authenticated', error: null });
    server.use(
      http.get('/api/v1/echo', ({ request }) =>
        HttpResponse.json({ auth: request.headers.get('authorization') }),
      ),
    );
    const res = await apiClient.get<{ auth: string }>('/echo');
    expect(res.auth).toBe('Bearer tok_live');
  });

  it('clears the session when a request returns 401', async () => {
    useAuthStore.setState({ session, status: 'authenticated', error: null });
    server.use(
      http.get('/api/v1/protected', () =>
        HttpResponse.json({ error: { message: 'no' } }, { status: 401 }),
      ),
    );
    await expect(apiClient.get('/protected')).rejects.toBeDefined();
    expect(useAuthStore.getState().session).toBeNull();
  });
});
