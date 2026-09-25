import { useEffect, type ReactNode } from 'react';
import { resolveTheme, useThemeStore } from './themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Applies the resolved theme to <html data-theme> and keeps it in sync with the
 * OS preference while the user's mode is "system". Rendering-agnostic: it draws
 * no DOM of its own, so it can wrap the whole app without affecting layout.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      root.setAttribute('data-theme', resolveTheme(mode));
    };
    apply();

    if (mode !== 'system' || !window.matchMedia) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [mode]);

  return <>{children}</>;
}
