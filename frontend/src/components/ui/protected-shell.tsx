'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/lib/auth-context';

type ProtectedShellProps = {
  children: React.ReactNode;
};

const links = [
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
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="panel-surface rounded-xl2 px-6 py-4 text-sm text-ink/70">
          Validando acesso...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <header className="panel-surface flex flex-col gap-6 rounded-[2rem] px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-pine">
              Area autenticada
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink">
              TaskFlow Workspace
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm text-ink/75">
              {user.name} · {user.email}
            </div>
            <button
              className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white/70"
              onClick={() => signOut()}
              type="button"
            >
              Sair
            </button>
          </div>
        </div>

        <nav className="flex flex-wrap gap-3">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                className={`rounded-full px-4 py-2 text-sm font-display uppercase tracking-[0.18em] transition ${
                  isActive
                    ? 'bg-ink text-white'
                    : 'border border-ink/10 bg-white/60 text-ink hover:bg-white'
                }`}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="mt-8">{children}</div>
    </main>
  );
}
