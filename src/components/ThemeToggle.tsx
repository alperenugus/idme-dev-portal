import { useTheme } from '../design-system';
import { Button } from '../design-system';

/** Cycles the resolved theme between light and dark. */
export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {resolved === 'dark' ? '☾ Dark' : '☀ Light'}
    </Button>
  );
}
