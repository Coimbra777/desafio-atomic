export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthTokenResponse = {
  access_token: string;
  token_type: 'Bearer';
};

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

export type AuthContextValue = {
  status: AuthStatus;
  token: string | null;
  user: User | null;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => void;
};

