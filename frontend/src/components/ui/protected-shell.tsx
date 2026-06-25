'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/lib/auth-context';

type ProtectedShellProps = {
  children: React.ReactNode;
};

const navLinks = [
  { href: '/kanban', label: 'Kanban' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function ProtectedShell({
  children,
}: ProtectedShellProps): JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, signOut } = useAuth();

  useEffect(() => {
    if (status === 'guest') {
      router.replace('/login');
    }
  }, [router, status]);

  if (status !== 'authenticated' || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-ink/10 bg-white px-6 py-4 text-sm text-ink/60 shadow-panel">
          Validando acesso...
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen">
      {/* ── Sticky top bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/kanban" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pine">
              <span className="text-[0.6rem] font-bold tracking-tight text-white">TF</span>
            </div>
            <span className="hidden text-sm font-semibold text-ink sm:block">TaskFlow</span>
          </Link>

          {/* Divider */}
          <div className="hidden h-5 w-px bg-ink/10 sm:block" />

          {/* Nav */}
          <nav className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-pine/10 text-pine'
                      : 'text-ink/55 hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User area */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight text-ink">{user.name}</p>
              <p className="text-[0.65rem] leading-tight text-ink/45">{user.email}</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine/15 ring-2 ring-white">
              <span className="text-xs font-semibold text-pine">{initials}</span>
            </div>
            <button
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink/65 transition hover:bg-ink/5 hover:text-ink"
              onClick={() => signOut()}
              type="button"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────── */}
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
