'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getCurrentUser, loginUser, registerUser } from './api';
import { clearStoredToken, getStoredToken, storeToken } from './auth-storage';
import type {
  AuthContextValue,
  AuthStatus,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types/auth';

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function bootstrap(): Promise<void> {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setStatus('guest');
        return;
      }

      try {
        const currentUser = await getCurrentUser(storedToken);
        setToken(storedToken);
        setUser(currentUser);
        setStatus('authenticated');
      } catch {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setStatus('guest');
      }
    }

    void bootstrap();
  }, []);

  async function signIn(payload: LoginPayload): Promise<void> {
    const response = await loginUser(payload);
    storeToken(response.access_token);
    const currentUser = await getCurrentUser(response.access_token);

    setToken(response.access_token);
    setUser(currentUser);
    setStatus('authenticated');
    router.replace('/kanban');
  }

  async function signUp(payload: RegisterPayload): Promise<void> {
    await registerUser(payload);
    await signIn({
      email: payload.email,
      password: payload.password,
    });
  }

  function signOut(): void {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setStatus('guest');
    router.replace('/login');
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      token,
      user,
      signIn,
      signUp,
      signOut,
    }),
    [status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}

