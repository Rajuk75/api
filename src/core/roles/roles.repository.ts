import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RoleScope, Prisma } from '@prisma/client';

export interface CreateRoleData {
  name: string;
  description?: string;
  tenantId?: string;
  scope?: RoleScope;
  isSystem?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export const ROLE_SELECT_FIELDS = {
  id: true,
  tenantId: true,
  name: true,
  description: true,
  scope: true,
  isSystem: true,
  isActive: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  rolePermissions: {
    select: {
      permission: {
        select: {
          id: true,
          code: true,
          name: true,
          resource: true,
          action: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoleData) {
    const { permissionIds, ...roleData } = data;

    return this.prisma.role.create({
      data: {
        ...roleData,
        rolePermissions: permissionIds && permissionIds.length > 0
          ? {
              create: permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      select: ROLE_SELECT_FIELDS,
    });
  }

  async findAll(
    tenantId?: string,
    scope?: RoleScope,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.RoleWhereInput = {
      isDeleted: false,
    };

    if (tenantId) {
      where.OR = [
        { tenantId },
        { isSystem: true }, // System default roles are visible everywhere
      ];
    }

    if (scope) {
      where.scope = scope;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [roles, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        skip,
        take: safeLimit,
        select: ROLE_SELECT_FIELDS,
        orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.role.count({ where }),
    ]);

    return { roles, total };
  }

  async findById(id: string) {
    return this.prisma.role.findFirst({
      where: { id, isDeleted: false },
      select: ROLE_SELECT_FIELDS,
    });
  }

  async findByName(name: string, tenantId?: string) {
    return this.prisma.role.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        tenantId: tenantId || null,
        isDeleted: false,
      },
      select: ROLE_SELECT_FIELDS,
    });
  }

  async update(id: string, data: UpdateRoleData) {
    const { permissionIds, ...roleData } = data;

    return this.prisma.$transaction(async (tx) => {
      if (permissionIds !== undefined) {
        // Delete existing role permissions
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Add new permissions
        if (permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          });
        }
      }

      return tx.role.update({
        where: { id },
        data: roleData,
        select: ROLE_SELECT_FIELDS,
      });
    });
  }

  async softDelete(id: string) {
    return this.prisma.role.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
      select: ROLE_SELECT_FIELDS,
    });
  }
}
