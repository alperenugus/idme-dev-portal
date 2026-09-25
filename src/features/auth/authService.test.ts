import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import { authService } from './authService';
import { ApiError } from '../../lib/api/errors';

describe('authService', () => {
  it('logs in a valid user and returns a session', async () => {
    const session = await authService.login({
      email: 'developer@acme.test',
      password: 'password',
    });
    expect(session.user.email).toBe('developer@acme.test');
    expect(session.token).toMatch(/^sess_/);
  });

  it('rejects invalid credentials with an ApiError', async () => {
    await expect(
      authService.login({ email: 'developer@acme.test', password: 'wrong' }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('logout resolves even when the network call fails', async () => {
    server.use(
      http.post('/api/v1/auth/logout', () => HttpResponse.error()),
    );
    await expect(authService.logout()).resolves.toBeUndefined();
  });

  it('logout calls the endpoint on the happy path', async () => {
    await expect(authService.logout()).resolves.toBeUndefined();
  });
});
