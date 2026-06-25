"use client";

import { FormEvent, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
      await signIn({ email, password });
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
      eyebrow="Acesso"
      title="Entre na sua conta"
      description="Use seu e-mail e senha para acessar o painel."
      footer={
        <p className="text-sm text-ink/55">
          Ainda não tem conta?{" "}
          <button
            className="font-semibold text-pine underline-offset-2 hover:underline"
            onClick={onToggleToRegister}
            type="button"
          >
            Criar nova conta
          </button>
        </p>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-ink/60">E-mail</span>
          <input
            className="input-base"
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-ink/60">Senha</span>
          <input
            className="input-base"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            minLength={8}
          />
        </label>

        {error ? <Alert>{error}</Alert> : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={status === "loading"}
          className="mt-1 w-full"
        >
          {isSubmitting ? "Entrando..." : "Fazer login"}
        </Button>
      </form>
    </AuthCard>
  );
}
