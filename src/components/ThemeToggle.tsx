import { useEffect, useState } from 'react';
import ThemeIcon from './ThemeIcon.tsx';

interface ThemeToggleProps {
  label: string;
}

export default function ThemeToggle({ label }: ThemeToggleProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] bg-surface-chip text-ink transition-colors hover:bg-[var(--surface-chip-hover)]"
    >
      <ThemeIcon dark={dark} />
    </button>
  );
}
