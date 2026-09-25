import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renders and navigates back to the portal', async () => {
    const { user } = renderWithProviders(
      <Routes>
        <Route path="/missing" element={<NotFoundPage />} />
        <Route path="/" element={<div>Portal home</div>} />
      </Routes>,
      { route: '/missing' },
    );
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to portal' }));
    expect(await screen.findByText('Portal home')).toBeInTheDocument();
  });
});
