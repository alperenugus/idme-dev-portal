import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequirePermission } from './RequirePermission';
import { useAuthStore } from './authStore';
import type { Role } from './permissions';
import type { Session } from './types';

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

describe('RequirePermission', () => {
  it('renders children when the user holds the permission', () => {
    signInAs(['developer']);
    render(
      <RequirePermission permission="app:create">
        <div>Create form</div>
      </RequirePermission>,
    );
    expect(screen.getByText('Create form')).toBeInTheDocument();
  });

  it('renders the fallback when the user lacks the permission', () => {
    signInAs(['viewer']);
    render(
      <RequirePermission permission="app:create" fallback={<div>No access</div>}>
        <div>Create form</div>
      </RequirePermission>,
    );
    expect(screen.getByText('No access')).toBeInTheDocument();
    expect(screen.queryByText('Create form')).not.toBeInTheDocument();
  });

  it('requires all permissions when given an array', () => {
    signInAs(['developer']);
    render(
      <RequirePermission
        permission={['app:create', 'app:delete']}
        fallback={<div>Blocked</div>}
      >
        <div>Danger zone</div>
      </RequirePermission>,
    );
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });
});
