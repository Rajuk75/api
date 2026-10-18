import { SUPERADMIN, ADMIN, TEACHER } from './enums';

const ROLES: Record<string, string[]> = {
  [SUPERADMIN]: [
    'tenant:create',
    'tenant:read',
    'tenant:update',
    'tenant:delete',
    'campus:create',
    'campus:read',
    'campus:update',
    'campus:delete',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'membership:create',
    'membership:read',
    'membership:update',
    'membership:delete',
  ],
  [ADMIN]: [
    'tenant:read',
    'tenant:update',
    'campus:create',
    'campus:read',
    'campus:update',
    'campus:delete',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'membership:create',
    'membership:read',
    'membership:update',
    'membership:delete',
  ],
  [TEACHER]: [
    'campus:read',
    'user:read',
  ],
};

export function hasPermission(userRole: string, permission: string): boolean {
  if (!userRole) return false;
  return ROLES[userRole]?.includes(permission) || false;
}

export { ROLES };
