import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import type { Permission } from './permissions';

export interface RequirePermissionProps {
  /** One or more permissions the user must hold (all are required). */
  permission: Permission | Permission[];
  children: ReactNode;
  /** Rendered instead of children when the user lacks the permission. */
  fallback?: ReactNode;
}

/**
 * Authorization guard. Unlike ProtectedRoute (which asks "are you signed in?"),
 * this asks "are you allowed to do this?" and renders a fallback (or nothing)
 * when not — used to gate the Create Application action for viewers.
 */
export function RequirePermission({
  permission,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { canAll } = useAuth();
  const required = Array.isArray(permission) ? permission : [permission];

  if (!canAll(required)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
