import { describe, expect, it, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import { AppLayout } from './AppLayout';
import { useAuthStore } from '../features/auth/authStore';
import type { Session } from '../features/auth/types';

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

function tree() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<div>Child page</div>} />
      </Route>
      <Route path="/login" element={<div>Login page</div>} />
    </Routes>
  );
}

beforeEach(() => {
  useAuthStore.setState({ session, status: 'authenticated', error: null });
});

describe('AppLayout', () => {
  it('renders the brand, user, and nested route', () => {
    renderWithProviders(tree(), { route: '/' });
    expect(screen.getByText('Developer Portal')).toBeInTheDocument();
    expect(screen.getByText('Dana Developer')).toBeInTheDocument();
    expect(screen.getByText('Acme, Inc.')).toBeInTheDocument();
    expect(screen.getByText('Child page')).toBeInTheDocument();
  });

  it('signs out and redirects to login', async () => {
    const { user } = renderWithProviders(tree(), { route: '/' });
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(useAuthStore.getState().session).toBeNull();
  });
});
