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

  return (
    <>
      {mode === "login" ? (
        <LoginForm onToggleToRegister={() => setMode("register")} />
      ) : (
        <RegisterForm onToggleToLogin={() => setMode("login")} />
      )}
    </>
  );
}
