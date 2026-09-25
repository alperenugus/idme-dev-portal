import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import { LoginPage } from './LoginPage';

function tree() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<div>Home dashboard</div>} />
    </Routes>
  );
}

describe('LoginPage', () => {
  it('signs in with the prefilled demo developer and navigates home', async () => {
    const { user } = renderWithProviders(tree(), { route: '/login' });
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Home dashboard')).toBeInTheDocument();
  });

  it('shows an error for invalid credentials', async () => {
    const { user } = renderWithProviders(tree(), { route: '/login' });
    const password = screen.getByLabelText(/Password/);
    await user.clear(password);
    await user.type(password, 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Invalid/);
  });
});
