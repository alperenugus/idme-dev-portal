import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  resolveTheme,
  systemPrefersDark,
  useThemeStore,
} from './themeStore';

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe('theme resolution', () => {
  afterEach(() => useThemeStore.setState({ mode: 'system' }));

  it('resolves explicit modes directly', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });

  it('resolves system mode from the OS preference', () => {
    mockMatchMedia(true);
    expect(systemPrefersDark()).toBe(true);
    expect(resolveTheme('system')).toBe('dark');
    mockMatchMedia(false);
    expect(resolveTheme('system')).toBe('light');
  });
});

describe('theme store actions', () => {
  afterEach(() => useThemeStore.setState({ mode: 'system' }));

  it('sets a mode', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('toggles based on the resolved theme', () => {
    mockMatchMedia(false); // system => light
    useThemeStore.setState({ mode: 'system' });
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().mode).toBe('dark');
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().mode).toBe('light');
  });
});
