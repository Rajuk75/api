# SchoolOS API — Auth & Permissions Architecture Guide

## 1. Overview & Architecture Philosophy

SchoolOS uses a streamlined, high-performance **Role & Permission Access Control** system designed for enterprise multi-tenancy and multi-campus institutions.

### Core Principles:
1. **Zero Database Query Overhead for Access Checks:**
   - Permissions are evaluated in-memory (`0ms` latency) using static role-permission mappings.
   - Eliminates redundant SQL joins across `role_permissions` and `permissions` tables on every request.
2. **Separation of Concerns:**
   - **Authentication (`AuthGuard`):** Verifies *who* the user is (JWT token validity, user active status). Returns `401 Unauthorized` if invalid.
   - **Authorization (`CheckPermissionGuard`):** Verifies *what* the user can do based on their assigned role. Returns `403 Forbidden` if missing permission.
3. **Single Composite Decorator:**
   - Developers only write `@CheckPermission('resource:action')` on endpoints. It automatically executes both `AuthGuard` and `CheckPermissionGuard`.

---

## 2. Roles Definition

File: [`src/common/constants/enums.ts`](file:///c:/ApnaKaam/school/api/src/common/constants/enums.ts)

```ts
export const SUPERADMIN = 'SUPERADMIN'; // Platform / SaaS Owner
export const ADMIN = 'ADMIN';           // School Principal / Management / Director
export const TEACHER = 'TEACHER';       // Faculty / Class Teachers
export const STUDENT = 'STUDENT';       // Learner Portal
export const PARENT = 'PARENT';         // Parent / Guardian Portal
export const STAFF = 'STAFF';           // Non-teaching staff / clerks
```

---

## 3. In-Memory Permissions Matrix

File: [`src/common/constants/permissions.ts`](file:///c:/ApnaKaam/school/api/src/common/constants/permissions.ts)

Permissions follow the standard convention: `<resource>:<action>`.

```ts
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
```

---

## 4. How to Protect Controller Endpoints (The 2-Rule Formula)

### Rule A: When you ONLY need to verify the user is logged in (Token Check)
Use `@UseGuards(AuthGuard)`.

```ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('users')
export class UsersController {
  @Get('get-my-profile')
  @UseGuards(AuthGuard)
  async getMyProfile(@Req() req) {
    // Accessible to any authenticated user (ADMIN, TEACHER, STUDENT, etc.)
    return req.user;
  }
}
```

### Rule B: When you need Token + Specific Role Permission
Use `@CheckPermission('resource:action')`.

```ts
import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { CheckPermission } from '../../common/decorators/permissions.decorator';

@Controller('campuses')
export class CampusesController {

  @Post('create-new-campus')
  @CheckPermission('campus:create')
  async createCampus(@Body() payload: CreateCampusDto) {
    // Only users whose role includes 'campus:create' can execute this
  }

  @Get('get-all-campuses')
  @CheckPermission('campus:read')
  async getAllCampuses() {
    // Accessible to SUPERADMIN, ADMIN, TEACHER
  }

  @Patch(':id/update-campus')
  @CheckPermission('campus:update')
  async updateCampus(@Param('id') id: string) { ... }

  @Delete(':id/delete-campus')
  @CheckPermission('campus:delete')
  async deleteCampus(@Param('id') id: string) { ... }
}
```

---

## 5. Multi-Tenant & Multi-Campus Context

### Database Model: `TenantMembership`
File: [`prisma/schema/tenant-membership.prisma`](file:///c:/ApnaKaam/school/api/prisma/schema/tenant-membership.prisma)

```prisma
model TenantMembership {
  id        String           @id @default(uuid())
  tenantId  String
  userId    String
  campusId  String?          // Associated Campus / Branch
  role      String           @default("ADMIN")
  status    MembershipStatus @default(ACTIVE)
  ...
}
```

### Multi-Branch Context Switching:
- A user can be assigned to multiple branches under the same school (e.g. Principal managing both Main Campus and City Branch).
- Endpoint: `POST /api/v1/auth/switch-context`
  - Takes `{ tenantId, campusId }`.
  - Issues a refreshed JWT containing `{ tenantId, campusId, role }`.
  - All subsequent database queries scope data using `where: { tenantId, campusId: request.user.campusId }`.

---

## 6. Seeded Test Credentials (Neon PostgreSQL)

| School Name | Campus Name | Email | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| Delhi Public School, R.K. Puram | Main Campus & City Branch | `principal.dpsrkp@schoolsaas.com` | `Password@123` | `ADMIN` |
| The Mother's International School | Main Campus | `principal.misdelhi@schoolsaas.com` | `Password@123` | `ADMIN` |
| Modern School, Barakhamba Road | Main Campus & City Branch | `principal.modernbarakhamba@schoolsaas.com` | `Password@123` | `ADMIN` |
| Bombay Scottish School | Main Campus & City Branch | `principal.bombayscottish@schoolsaas.com` | `Password@123` | `ADMIN` |
| Dhirubhai Ambani International School | Main Campus | `principal.dais@schoolsaas.com` | `Password@123` | `ADMIN` |
