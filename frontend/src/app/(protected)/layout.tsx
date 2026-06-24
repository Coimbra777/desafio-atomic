'use client';

import { ProtectedShell } from '@/components/ui/protected-shell';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return <ProtectedShell>{children}</ProtectedShell>;
}

