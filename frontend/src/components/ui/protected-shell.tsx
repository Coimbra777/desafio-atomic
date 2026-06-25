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
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <header className="panel-surface mx-auto flex w-full max-w-[1500px] flex-col gap-6 rounded-[2rem] px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-display text-[0.7rem] uppercase tracking-[0.35em] text-pine">
              Workspace autenticado
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              TaskFlow Board
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
              Fluxo simples de trabalho com autenticacao, Kanban, dashboard e notificacoes assincronas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="rounded-[1.25rem] border border-ink/10 bg-[#f8fafb] px-4 py-3 text-sm text-ink/75">
              <p className="font-semibold text-ink">{user.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/45">
                {user.email}
              </p>
            </div>
            <button
              className="rounded-[1.1rem] border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-sand/35"
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
                className={`rounded-[1.1rem] px-4 py-3 text-sm font-display uppercase tracking-[0.18em] transition ${
                  isActive
                    ? 'bg-pine text-white shadow-card'
                    : 'border border-ink/10 bg-white text-ink hover:bg-sand/35'
                }`}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto mt-6 w-full max-w-[1500px]">{children}</div>
    </main>
  );
}
