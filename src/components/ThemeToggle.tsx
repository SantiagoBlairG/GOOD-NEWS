import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useApp } from '../state/provider';

const subscribe = (callback: () => void) => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function ThemeToggle() {
  const { state, dispatch } = useApp();
  const prefersDark = useSyncExternalStore(subscribe, systemDark, () => false);
  const dark =
    state.preferences.appearance === 'dark' ||
    (state.preferences.appearance === 'system' && prefersDark);
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      aria-label={label}
      title={label}
      onClick={() =>
        dispatch({
          type: 'preferences',
          value: { ...state.preferences, appearance: dark ? 'light' : 'dark' },
        })
      }
    >
      {dark ? <Sun size={21} /> : <Moon size={21} />}
      <span>{dark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
