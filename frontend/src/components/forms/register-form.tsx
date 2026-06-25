"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthCard } from "../ui/auth-card";

type RegisterFormProps = {
  onToggleToLogin: () => void;
  initialEmail?: string;
};

const EMAIL_TAKEN_MARKER = "já está cadastrado";

export function RegisterForm({
  onToggleToLogin,
  initialEmail = "",
}: RegisterFormProps): JSX.Element {
  const { signUp, status } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // When an email arrives pre-filled from the login form, focus the name field
  useEffect(() => {
    if (initialEmail) {
      nameInputRef.current?.focus();
    }
  }, [initialEmail]);

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

  const isEmailTakenError = error?.includes(EMAIL_TAKEN_MARKER) ?? false;

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
            ref={nameInputRef}
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
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
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

        {error ? (
          isEmailTakenError ? (
            <Alert>
              <p>Este e-mail já possui uma conta.</p>
              <button
                className="mt-2 inline-flex items-center gap-1 font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
                onClick={onToggleToLogin}
                type="button"
              >
                Faça login para continuar →
              </button>
            </Alert>
          ) : (
            <Alert>{error}</Alert>
          )
        ) : null}

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
