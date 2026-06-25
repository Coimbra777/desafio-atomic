"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { useAuth } from "@/lib/auth-context";

import { AuthCard } from "../ui/auth-card";

type LoginFormProps = {
  onToggleToRegister: () => void;
};

export function LoginForm({ onToggleToRegister }: LoginFormProps): JSX.Element {
  const { signIn, status } = useAuth();
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
      await signIn({
        email,
        password,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível fazer login. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow="TaskFlow"
      title="Entre em sua conta"
      description="Use seu e-mail e senha para acessar a sua conta."
      footer={
        <p className="text-sm text-ink/70">
          Ainda não tem conta?{" "}
          <button
            className="font-semibold text-pine hover:text-pine/80 transition"
            onClick={onToggleToRegister}
            type="button"
          >
            Criar nova conta
          </button>
        </p>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm text-ink">
          <span className="font-display uppercase tracking-[0.2em] text-xs text-ink/65">
            E-mail
          </span>
          <input
            className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 outline-none transition focus:border-pine"
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
            className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 outline-none transition focus:border-pine"
            type="password"
            placeholder="Digite sua senha"
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
          className="rounded-full bg-pine px-5 py-3 font-display text-sm uppercase tracking-[0.18em] text-white transition hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || status === "loading"}
          type="submit"
        >
          {isSubmitting ? "Entrando..." : "Fazer login"}
        </button>
      </form>
    </AuthCard>
  );
}
