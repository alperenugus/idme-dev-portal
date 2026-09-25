import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import { CreateApplicationPage } from './CreateApplicationPage';
import { useAuthStore } from '../features/auth/authStore';
import type { Role } from '../features/auth/permissions';
import type { Session } from '../features/auth/types';

function signInAs(roles: Role[]) {
  const session: Session = {
    token: 't',
    expiresAt: Date.now() + 60_000,
    user: {
      id: 'u',
      name: 'User',
      email: 'user@acme.test',
      organizationId: 'o',
      organizationName: 'Acme',
      roles,
    },
  };
  useAuthStore.setState({ session, status: 'authenticated', error: null });
}

describe('CreateApplicationPage', () => {
  it('renders the wizard for a user with app:create', () => {
    signInAs(['developer']);
    renderWithProviders(<CreateApplicationPage />);
    expect(
      screen.getByRole('heading', { name: 'Create a new application' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('shows a no-access fallback for a viewer', () => {
    signInAs(['viewer']);
    renderWithProviders(<CreateApplicationPage />);
    expect(screen.getByText(/don’t have access/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Continue' }),
    ).not.toBeInTheDocument();
  });
});
