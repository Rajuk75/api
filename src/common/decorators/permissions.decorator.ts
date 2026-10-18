import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CheckPermissionGuard } from '../guards/permissions.guard';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Checks JWT Auth and verifies user role has required permission(s)
 * Usage: @CheckPermission('campus:create')
 */
export function CheckPermission(...permissions: string[]) {
  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    UseGuards(AuthGuard, CheckPermissionGuard),
  );
}
