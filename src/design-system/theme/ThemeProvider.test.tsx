import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { useThemeStore } from './themeStore';

type ChangeHandler = () => void;

function installMatchMedia(initialDark: boolean) {
  let matches = initialDark;
  const handlers = new Set<ChangeHandler>();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (_: string, cb: ChangeHandler) => handlers.add(cb),
    removeEventListener: (_: string, cb: ChangeHandler) => handlers.delete(cb),
  })) as unknown as typeof window.matchMedia;
  return {
    emitChange(next: boolean) {
      matches = next;
      handlers.forEach((h) => h());
    },
  };
}

function ThemeProbe() {
  const { mode, resolved, setMode, toggle } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setMode('dark')}>go dark</button>
      <button onClick={toggle}>toggle</button>
    </div>
  );
}

describe('ThemeProvider + useTheme', () => {
  afterEach(() => {
    useThemeStore.setState({ mode: 'system' });
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies an explicit mode to <html data-theme>', () => {
    installMatchMedia(false);
    useThemeStore.setState({ mode: 'dark' });
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('setMode and toggle update the applied theme', async () => {
    installMatchMedia(false); // system => light
    useThemeStore.setState({ mode: 'system' });
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    await userEvent.click(screen.getByText('go dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    await userEvent.click(screen.getByText('toggle'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('follows OS changes while mode is system', () => {
    const media = installMatchMedia(false);
    useThemeStore.setState({ mode: 'system' });
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    act(() => media.emitChange(true));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
