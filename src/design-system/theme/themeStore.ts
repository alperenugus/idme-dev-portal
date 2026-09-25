import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'devportal.theme';

export function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

/**
 * Global theme store. Persists the user's *preference* (which may be "system"),
 * never the resolved value — so following the OS remains dynamic across reloads.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      toggle: () => {
        const resolved = resolveTheme(get().mode);
        set({ mode: resolved === 'dark' ? 'light' : 'dark' });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
