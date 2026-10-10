import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { TenantType, TenantStatus, Prisma } from '@prisma/client';

export interface CreateTenantData {
  name: string;
  type?: TenantType;
  timezone?: string;
  defaultLocale?: string;
}

export interface UpdateTenantData {
  name?: string;
  type?: TenantType;
  timezone?: string;
  defaultLocale?: string;
  status?: TenantStatus;
  isActive?: boolean;
}

export const TENANT_SELECT_FIELDS = {
  id: true,
  name: true,
  type: true,
  status: true,
  timezone: true,
  defaultLocale: true,
  isActive: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class TenantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTenantData) {
    return this.prisma.tenant.create({
      data,
      select: TENANT_SELECT_FIELDS,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: TenantType,
    status?: TenantStatus,
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.TenantWhereInput = {
      isDeleted: false,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const [tenants, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: safeLimit,
        select: TENANT_SELECT_FIELDS,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { tenants, total };
  }

  async findById(id: string) {
    return this.prisma.tenant.findFirst({
      where: { id, isDeleted: false },
      select: TENANT_SELECT_FIELDS,
    });
  }

  async update(id: string, data: UpdateTenantData) {
    return this.prisma.tenant.update({
      where: { id },
      data,
      select: TENANT_SELECT_FIELDS,
    });
  }

  async softDelete(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
      select: TENANT_SELECT_FIELDS,
    });
  }

  async updateStatus(id: string, status: TenantStatus) {
    return this.prisma.tenant.update({
      where: { id },
      data: {
        status,
      },
      select: TENANT_SELECT_FIELDS,
    });
  }
}
