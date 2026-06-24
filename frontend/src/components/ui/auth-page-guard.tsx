'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/lib/auth-context';

type AuthPageGuardProps = {
  children: React.ReactNode;
};

export function AuthPageGuard({
  children,
}: AuthPageGuardProps): JSX.Element | null {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/kanban');
    }
  }, [router, status]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="panel-surface rounded-xl2 px-6 py-4 text-sm text-ink/70">
          Carregando autenticacao...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

