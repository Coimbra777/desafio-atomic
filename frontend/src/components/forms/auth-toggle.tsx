"use client";

import { useState } from "react";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

type AuthToggleProps = {
  initialMode?: "login" | "register";
};

export function AuthToggle({
  initialMode = "login",
}: AuthToggleProps): JSX.Element {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [registrationEmail, setRegistrationEmail] = useState("");

  function goToRegister(email: string): void {
    setRegistrationEmail(email);
    setMode("register");
  }

  function goToLogin(): void {
    setMode("login");
  }

  return (
    <>
      {mode === "login" ? (
        <LoginForm onToggleToRegister={goToRegister} />
      ) : (
        <RegisterForm
          initialEmail={registrationEmail}
          onToggleToLogin={goToLogin}
        />
      )}
    </>
  );
}
