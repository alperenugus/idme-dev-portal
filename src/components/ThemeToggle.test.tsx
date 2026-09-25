import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../design-system';
import { useThemeStore } from '../design-system/theme/themeStore';

describe('ThemeToggle', () => {
  it('toggles between light and dark', async () => {
    useThemeStore.setState({ mode: 'light' });
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole('button', { name: /Switch to dark theme/ }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));
    expect(
      screen.getByRole('button', { name: /Switch to light theme/ }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
