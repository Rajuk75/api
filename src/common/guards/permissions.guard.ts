import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import logger from '../utils/logger';

@Injectable()
export class CheckPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

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

    let userPermissions: string[] = user.permissions || [];

    // If permissions not in user token/context and roleId is available, load from database
    if (userPermissions.length === 0 && user.roleId && this.prisma) {
      const role = await this.prisma.role.findFirst({
        where: { id: user.roleId, isDeleted: false, isActive: true },
        select: {
          rolePermissions: {
            where: { isDeleted: false, isActive: true },
            select: {
              permission: {
                select: { code: true },
              },
            },
          },
        },
      });

      if (role?.rolePermissions) {
        userPermissions = role.rolePermissions.map((rp) => rp.permission.code);
        user.permissions = userPermissions;
      }
    }

    const hasAllRequired = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllRequired) {
      logger.warn(
        `CheckPermissionGuard > User ${user.id} lacks required permissions: [${requiredPermissions.join(', ')}]`,
      );
      throw new ForbiddenException(
        `Access denied: Missing required permission [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}

// Aliases for convenience and backward compatibility
export const CheckPermission = CheckPermissionGuard;
export const PermissionsGuard = CheckPermissionGuard;
