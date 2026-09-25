import {
  resolveTheme,
  useThemeStore,
  type ResolvedTheme,
  type ThemeMode,
} from './themeStore';

export interface UseThemeResult {
  /** The user's chosen preference: light | dark | system. */
  mode: ThemeMode;
  /** The concrete theme currently applied to the DOM. */
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

/** Ergonomic hook over the global theme store. */
export function useTheme(): UseThemeResult {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const toggle = useThemeStore((s) => s.toggle);

  return { mode, resolved: resolveTheme(mode), setMode, toggle };
}
