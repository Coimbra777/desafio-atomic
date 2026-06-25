"use client";

import { FormEvent, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
      await signUp({ name, email, password });
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
      eyebrow="Cadastro"
      title="Crie sua conta"
      description="Preencha os dados abaixo e você terá acesso imediato ao painel."
      footer={
        <p className="text-sm text-ink/55">
          Já tem conta?{" "}
          <button
            className="font-semibold text-pine underline-offset-2 hover:underline"
            onClick={onToggleToLogin}
            type="button"
          >
            Voltar para login
          </button>
        </p>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-ink/60">Nome</span>
          <input
            className="input-base"
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            maxLength={120}
          />
        </label>

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
            placeholder="Mínimo de 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
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
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </AuthCard>
  );
}
