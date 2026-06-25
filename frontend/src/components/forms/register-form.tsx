"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { useAuth } from "@/lib/auth-context";

import { AuthCard } from "../ui/auth-card";

type RegisterFormProps = {
  onToggleToLogin: () => void;
};

export function RegisterForm({
  onToggleToLogin,
}: RegisterFormProps): JSX.Element {
  const { signUp, status } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
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
          : "Não foi possível criar a conta. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Criar conta"
      title="Crie sua conta"
      description="Preencha os dados abaixo e você terá acesso imediato à sua conta."
      footer={
        <p className="text-sm text-ink/70">
          Já tem conta?{" "}
          <button
            className="font-semibold text-ember hover:text-ember/80 transition"
            onClick={onToggleToLogin}
            type="button"
          >
            Voltar para login
          </button>
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
            placeholder="Mínimo de 8 caracteres"
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
          disabled={isSubmitting || status === "loading"}
          type="submit"
        >
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
    </AuthCard>
  );
}
