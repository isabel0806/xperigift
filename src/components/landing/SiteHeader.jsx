import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/industries', label: 'Industries' },
  { to: '/about', label: 'About' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-6 sm:px-10">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="font-display text-[22px] font-semibold tracking-tight text-ink leading-none lowercase">
            xperigift
          </span>
          <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-emerald" aria-hidden />
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[14px] transition-colors ${isActive ? 'text-ink font-medium' : 'text-ink-soft hover:text-ink'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5">
          <Link to="/portal" className="text-[14px] text-ink-soft hover:text-ink transition-colors">
            Client sign in
          </Link>
          <a
            href="https://calendly.com/isabel-thegiftcardcafe/30min"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-sm bg-ink px-5 text-[14px] font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Book your audit
          </a>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-hairline bg-paper">
          <nav className="mx-auto flex max-w-[1100px] flex-col px-6 py-4 gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-sm px-3 py-3 text-[15px] text-ink-soft hover:bg-paper-soft"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/portal"
              className="rounded-sm px-3 py-3 text-[15px] text-ink-soft hover:bg-paper-soft"
              onClick={() => setOpen(false)}
            >
              Client sign in
            </Link>
            <a
              href="https://calendly.com/isabel-thegiftcardcafe/30min"
              target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-sm bg-ink px-5 text-[14px] font-medium text-paper"
              onClick={() => setOpen(false)}
            >
              Book your audit
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
