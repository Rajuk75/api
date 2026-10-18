import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { hasPermission } from '../constants/permissions';
import logger from '../utils/logger';

@Injectable()
export class CheckPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      logger.warn('CheckPermissionGuard > No authenticated user on request');
      throw new ForbiddenException('Access denied: Authentication required');
    }

    const userRole = user.role;

    // Check if user's role has all required permissions using permissions.ts
    const hasAllRequired = requiredPermissions.every((perm) =>
      hasPermission(userRole, perm),
    );

    if (!hasAllRequired) {
      logger.warn(
        `CheckPermissionGuard > User role "${userRole}" lacks required permissions: [${requiredPermissions.join(', ')}]`,
      );
      throw new ForbiddenException(
        `Access denied: Missing required permission [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}

