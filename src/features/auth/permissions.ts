/**
 * Role-Based Access Control.
 *
 * Roles are assigned to users; permissions are what the UI actually checks.
 * Keeping the check on *permissions* (not roles) means a role's capabilities can
 * change in one place without touching every guard.
 */

export const ROLES = ['owner', 'admin', 'developer', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'app:read',
  'app:create',
  'app:update',
  'app:delete',
  'app:submit',
  'credentials:rotate',
  'org:manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [...PERMISSIONS],
  admin: [
    'app:read',
    'app:create',
    'app:update',
    'app:delete',
    'app:submit',
    'credentials:rotate',
  ],
  developer: ['app:read', 'app:create', 'app:update', 'app:submit'],
  viewer: ['app:read'],
};

export function permissionsForRoles(roles: Role[]): Set<Permission> {
  const result = new Set<Permission>();
  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role] ?? []) {
      result.add(permission);
    }
  }
  return result;
}

export function hasPermission(
  granted: Set<Permission>,
  required: Permission,
): boolean {
  return granted.has(required);
}

export function hasAllPermissions(
  granted: Set<Permission>,
  required: Permission[],
): boolean {
  return required.every((p) => granted.has(p));
}
