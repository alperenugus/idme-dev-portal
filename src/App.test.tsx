import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { useAuthStore } from './features/auth/authStore';
import type { Session } from './features/auth/types';

const session: Session = {
  token: 't',
  expiresAt: Date.now() + 60_000,
  user: {
    id: 'u',
    name: 'Dana Developer',
    email: 'dev@acme.test',
    organizationId: 'o',
    organizationName: 'Acme, Inc.',
    roles: ['developer'],
  },
};

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

describe('App', () => {
  it('redirects an unauthenticated visitor to the sign-in screen', async () => {
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('routes an authenticated user to the create-application page', async () => {
    useAuthStore.setState({ session, status: 'authenticated', error: null });
    render(<App />);
    expect(
      await screen.findByRole('heading', { name: 'Create a new application' }),
    ).toBeInTheDocument();
  });
});
