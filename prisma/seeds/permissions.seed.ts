import { PrismaClient } from '@prisma/client';

export interface PermissionSeedData {
  code: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export const SYSTEM_PERMISSIONS: PermissionSeedData[] = [
  // Tenant
  { code: 'tenant:read', name: 'Read Tenant', resource: 'tenant', action: 'read', description: 'View school/tenant information' },
  { code: 'tenant:update', name: 'Update Tenant', resource: 'tenant', action: 'update', description: 'Modify school/tenant information' },

  // Campus
  { code: 'campus:read', name: 'Read Campuses', resource: 'campus', action: 'read', description: 'View campuses and branch details' },
  { code: 'campus:create', name: 'Create Campus', resource: 'campus', action: 'create', description: 'Add new school branches' },
  { code: 'campus:update', name: 'Update Campus', resource: 'campus', action: 'update', description: 'Modify school branch details' },
  { code: 'campus:delete', name: 'Delete Campus', resource: 'campus', action: 'delete', description: 'Remove school branch' },

  // User
  { code: 'user:read', name: 'Read Users', resource: 'user', action: 'read', description: 'View users list' },
  { code: 'user:create', name: 'Create User', resource: 'user', action: 'create', description: 'Register new users' },
  { code: 'user:update', name: 'Update User', resource: 'user', action: 'update', description: 'Modify user profiles' },
  { code: 'user:delete', name: 'Delete User', resource: 'user', action: 'delete', description: 'Soft delete user account' },

  // Roles & Permissions
  { code: 'role:read', name: 'Read Roles', resource: 'role', action: 'read', description: 'View roles and permissions' },
  { code: 'role:create', name: 'Create Role', resource: 'role', action: 'create', description: 'Define custom roles' },
  { code: 'role:update', name: 'Update Role', resource: 'role', action: 'update', description: 'Modify role permissions' },
  { code: 'role:delete', name: 'Delete Role', resource: 'role', action: 'delete', description: 'Delete custom roles' },

  // Memberships
  { code: 'membership:read', name: 'Read Memberships', resource: 'membership', action: 'read', description: 'View school and campus members' },
  { code: 'membership:create', name: 'Add Member', resource: 'membership', action: 'create', description: 'Assign user to school or campus' },
  { code: 'membership:update', name: 'Update Member', resource: 'membership', action: 'update', description: 'Change member role or status' },
  { code: 'membership:delete', name: 'Remove Member', resource: 'membership', action: 'delete', description: 'Remove member from school' },
];

export async function seedPermissions(prisma: PrismaClient) {
  console.log(`Starting permissions seeding (${SYSTEM_PERMISSIONS.length} permissions)...`);

  for (const permission of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log(`Successfully seeded ${SYSTEM_PERMISSIONS.length} permissions.`);
}
