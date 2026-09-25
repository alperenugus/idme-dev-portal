import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from './authStore';
import type { Session } from './types';

function tree(initial: string) {
  return (
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/login" element={<div>Login screen</div>} />
        <Route
          path="/secret"
          element={
            <ProtectedRoute>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

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

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated user to login', () => {
    render(tree('/secret'));
    expect(screen.getByText('Login screen')).toBeInTheDocument();
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
  });

  it('renders children for an authenticated user', () => {
    useAuthStore.setState({ session, status: 'authenticated', error: null });
    render(tree('/secret'));
    expect(screen.getByText('Secret content')).toBeInTheDocument();
  });
});
