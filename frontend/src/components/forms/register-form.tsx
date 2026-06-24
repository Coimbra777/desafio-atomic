'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

import { useAuth } from '@/lib/auth-context';

import { AuthCard } from '../ui/auth-card';

export function RegisterForm(): JSX.Element {
  const { signUp, status } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signUp({
        name,
        email,
        password,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Nao foi possivel criar a conta.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Nova conta"
      title="Crie seu acesso"
      description="O cadastro usa os endpoints reais do backend e autentica voce logo em seguida."
      footer={
        <p className="text-sm text-ink/70">
          Ja tem conta?{' '}
          <Link className="font-semibold text-ember" href="/login">
            Fazer login
          </Link>
        </p>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm text-ink">
          <span className="font-display uppercase tracking-[0.2em] text-xs text-ink/65">
            Nome
          </span>
          <input
            className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 outline-none transition focus:border-ember"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-2 text-sm text-ink">
          <span className="font-display uppercase tracking-[0.2em] text-xs text-ink/65">
            E-mail
          </span>
          <input
            className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 outline-none transition focus:border-ember"
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-2 text-sm text-ink">
          <span className="font-display uppercase tracking-[0.2em] text-xs text-ink/65">
            Senha
          </span>
          <input
            className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 outline-none transition focus:border-ember"
            type="password"
            placeholder="Minimo de 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          className="rounded-full bg-ember px-5 py-3 font-display text-sm uppercase tracking-[0.18em] text-white transition hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || status === 'loading'}
          type="submit"
        >
          {isSubmitting ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
    </AuthCard>
  );
}

