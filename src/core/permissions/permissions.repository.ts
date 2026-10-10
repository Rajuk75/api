import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreatePermissionData {
  code: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export const PERMISSION_SELECT_FIELDS = {
  id: true,
  code: true,
  name: true,
  description: true,
  resource: true,
  action: true,
  isActive: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionData) {
    return this.prisma.permission.create({
      data,
      select: PERMISSION_SELECT_FIELDS,
    });
  }

  async findAll(resource?: string, action?: string) {
    const where: Prisma.PermissionWhereInput = {
      isDeleted: false,
    };

    if (resource) {
      where.resource = resource;
    }

    if (action) {
      where.action = action;
    }

    return this.prisma.permission.findMany({
      where,
      select: PERMISSION_SELECT_FIELDS,
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.permission.findFirst({
      where: { id, isDeleted: false },
      select: PERMISSION_SELECT_FIELDS,
    });
  }

  async findByCode(code: string) {
    return this.prisma.permission.findFirst({
      where: { code, isDeleted: false },
      select: PERMISSION_SELECT_FIELDS,
    });
  }

  async bulkCreate(permissions: CreatePermissionData[]) {
    return this.prisma.$transaction(
      permissions.map((p) =>
        this.prisma.permission.upsert({
          where: { code: p.code },
          update: { name: p.name, description: p.description, resource: p.resource, action: p.action },
          create: p,
          select: PERMISSION_SELECT_FIELDS,
        }),
      ),
    );
  }
}
