import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';

import './globals.css';

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'TaskFlow frontend authentication base',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="pt-BR">
      <body className="bg-hero-grid font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
