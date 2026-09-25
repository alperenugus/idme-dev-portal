import { describe, expect, it } from 'vitest';
import {
  hasAllPermissions,
  hasPermission,
  permissionsForRoles,
} from './permissions';

describe('permissionsForRoles', () => {
  it('grants a viewer only read', () => {
    const perms = permissionsForRoles(['viewer']);
    expect(perms.has('app:read')).toBe(true);
    expect(perms.has('app:create')).toBe(false);
  });

  it('grants a developer create/submit but not delete', () => {
    const perms = permissionsForRoles(['developer']);
    expect(perms.has('app:create')).toBe(true);
    expect(perms.has('app:submit')).toBe(true);
    expect(perms.has('app:delete')).toBe(false);
  });

  it('grants an owner everything, including org management', () => {
    const perms = permissionsForRoles(['owner']);
    expect(perms.has('org:manage')).toBe(true);
  });

  it('unions permissions across multiple roles', () => {
    const perms = permissionsForRoles(['viewer', 'developer']);
    expect(perms.has('app:read')).toBe(true);
    expect(perms.has('app:create')).toBe(true);
  });

  it('ignores unknown roles gracefully', () => {
    // @ts-expect-error — testing defensive default
    expect(permissionsForRoles(['ghost']).size).toBe(0);
  });
});

describe('permission checks', () => {
  it('hasPermission checks a single permission', () => {
    const perms = permissionsForRoles(['developer']);
    expect(hasPermission(perms, 'app:create')).toBe(true);
    expect(hasPermission(perms, 'org:manage')).toBe(false);
  });

  it('hasAllPermissions requires every permission', () => {
    const perms = permissionsForRoles(['admin']);
    expect(hasAllPermissions(perms, ['app:create', 'app:delete'])).toBe(true);
    expect(hasAllPermissions(perms, ['app:create', 'org:manage'])).toBe(false);
  });
});
