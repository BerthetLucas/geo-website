import { useState } from 'react';
import ToggleIcon from './ToggleIcon.tsx';

interface NavLink {
  href: string;
  label: string;
}

interface LocaleLink extends NavLink {
  locale: string;
  current: boolean;
}

interface MobileNavProps {
  navLabel: string;
  openLabel: string;
  closeLabel: string;
  links: NavLink[];
  localeLinks: LocaleLink[];
}

export default function MobileNav({
  navLabel,
  openLabel,
  closeLabel,
  links,
  localeLinks,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const buttonLabel = open ? closeLabel : openLabel;

  return (
    <nav aria-label={navLabel} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={buttonLabel}
        className="bg-surface-chip text-ink inline-flex h-9 w-9 items-center justify-center rounded-[9px]"
      >
        <ToggleIcon open={open} />
      </button>

      <ul
        hidden={!open}
        className="border-border-token bg-surface-page absolute top-11 right-0 z-50 flex min-w-44 flex-col gap-1 rounded-[10px] border p-2 shadow-lg"
      >
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-ink hover:bg-surface-chip block rounded-[7px] px-3 py-2 text-sm font-medium"
            >
              {link.label}
            </a>
          </li>
        ))}
        <li className="border-border-token my-1 border-t" aria-hidden="true" />
        {localeLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              hrefLang={link.locale}
              aria-current={link.current ? 'page' : undefined}
              className="text-ink-3 hover:bg-surface-chip aria-[current=page]:bg-surface-chip aria-[current=page]:text-ink block rounded-[7px] px-3 py-2 text-sm font-medium"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
