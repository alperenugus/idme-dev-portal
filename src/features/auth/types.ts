import type { Role } from './permissions';

export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  organizationName: string;
  roles: Role[];
}

export interface Session {
  token: string;
  user: User;
  /** Epoch milliseconds at which the token expires. */
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'error';
