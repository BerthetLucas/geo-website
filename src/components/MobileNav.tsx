import { useState } from 'react';
import ToggleIcon from './ToggleIcon.tsx';

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  navLabel: string;
  openLabel: string;
  closeLabel: string;
  links: NavLink[];
}

export default function MobileNav({ navLabel, openLabel, closeLabel, links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const buttonLabel = open ? closeLabel : openLabel;

  return (
    <nav aria-label={navLabel} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={buttonLabel}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] bg-surface-chip text-ink"
      >
        <ToggleIcon open={open} />
      </button>

      <ul
        hidden={!open}
        className="absolute right-0 top-11 z-10 flex min-w-44 flex-col gap-1 rounded-[10px] border border-border-token bg-surface-page p-2 shadow-lg"
      >
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="block rounded-[7px] px-3 py-2 text-sm font-medium text-ink hover:bg-surface-chip">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
