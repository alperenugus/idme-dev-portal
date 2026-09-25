import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Where to send unauthenticated users. */
  redirectTo?: string;
}

/**
 * Authentication guard. Renders children only for a signed-in user; otherwise
 * redirects to login, preserving the attempted location in router state so the
 * app can return the user there after they sign in.
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
