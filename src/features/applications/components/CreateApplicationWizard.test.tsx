import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/utils';
import { CreateApplicationWizard } from './CreateApplicationWizard';
import { useAuthStore } from '../../auth/authStore';
import type { Session } from '../../auth/types';

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

beforeEach(() => {
  useAuthStore.setState({ session, status: 'authenticated', error: null });
});

async function fillThroughToReview(user: ReturnType<typeof renderWithProviders>['user']) {
  // Details
  await user.type(screen.getByLabelText(/Application name/), 'Acme Veterans');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  // Redirects
  await user.type(
    screen.getByLabelText('Redirect URI 1'),
    'https://acme.com/callback',
  );
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

describe('CreateApplicationWizard', () => {
  it('blocks Continue and shows an error on an invalid step', async () => {
    const { user } = renderWithProviders(<CreateApplicationWizard />);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('completes the flow and reveals one-time credentials', async () => {
    const { user } = renderWithProviders(<CreateApplicationWizard />);
    await fillThroughToReview(user);

    // Scopes: openid preselected; add a community scope to trigger review note.
    expect(screen.getByRole('checkbox', { name: /OpenID/ })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: /Military/ }));
    expect(screen.getByText(/require ID.me review/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Review
    expect(screen.getByText('Acme Veterans')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create application' }));

    // Success
    expect(await screen.findByText(/Acme Veterans is ready/)).toBeInTheDocument();
    expect(screen.getByText(/In review/)).toBeInTheDocument();

    // Client ID visible; secret masked until revealed.
    expect(screen.getByText(/^idme_/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reveal Client secret' }));
    expect(screen.getByText(/^secret_/)).toBeInTheDocument();
  });

  it('supports Back navigation and resetting after creation', async () => {
    const { user } = renderWithProviders(<CreateApplicationWizard />);
    await fillThroughToReview(user);
    // Back from scopes to redirects
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Redirect URI 1')).toHaveValue(
      'https://acme.com/callback',
    );
    // Forward again and finish
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Create application' }));

    await screen.findByText(/is ready/);
    await user.click(screen.getByRole('button', { name: 'Create another' }));
    await waitFor(() =>
      expect(screen.getByLabelText(/Application name/)).toHaveValue(''),
    );
  });

  it('blocks the scopes step when openid is removed', async () => {
    const { user } = renderWithProviders(<CreateApplicationWizard />);
    await fillThroughToReview(user);
    // Select another scope, then uncheck openid, so scopes are non-empty but
    // missing the required openid — exercising that specific validation branch.
    await user.click(screen.getByRole('checkbox', { name: /Email/ }));
    await user.click(screen.getByRole('checkbox', { name: /OpenID/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText(/"openid" scope is required/i)).toBeInTheDocument();
  });

  it('validates the redirect step and supports add/remove rows', async () => {
    const { user } = renderWithProviders(<CreateApplicationWizard />);
    await user.type(screen.getByLabelText(/Application name/), 'Acme');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Empty URI -> error
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText(/add at least one redirect uri/i)).toBeInTheDocument();

    // Add a second row, then a bad URL shows a row-level error
    await user.click(screen.getByRole('button', { name: /Add another URI/ }));
    await user.type(screen.getByLabelText('Redirect URI 1'), 'http://insecure.com');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    // The message appears at both row and step level.
    expect(screen.getAllByText(/must use https/i).length).toBeGreaterThan(0);

    // Remove the second (empty) row
    await user.click(
      screen.getByRole('button', { name: 'Remove redirect URI 2' }),
    );
    expect(screen.queryByLabelText('Redirect URI 2')).not.toBeInTheDocument();
  });
});
