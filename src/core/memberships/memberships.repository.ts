import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MembershipStatus, Prisma } from '@prisma/client';

export interface CreateMembershipData {
  userId: string;
  tenantId: string;
  campusId?: string;
  role?: string;
  status?: MembershipStatus;
}

export interface UpdateMembershipData {
  campusId?: string;
  role?: string;
  status?: MembershipStatus;
  isActive?: boolean;
}

export const MEMBERSHIP_SELECT_FIELDS = {
  id: true,
  userId: true,
  tenantId: true,
  campusId: true,
  role: true,
  status: true,
  joinedAt: true,
  isActive: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  tenant: {
    select: {
      id: true,
      name: true,
    },
  },
  campus: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
} as const;

@Injectable()
export class MembershipsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMembershipData) {
    return this.prisma.tenantMembership.create({
      data: {
        ...data,
        joinedAt: new Date(),
      },
      select: MEMBERSHIP_SELECT_FIELDS,
    });
  }

  async findAll(
    tenantId?: string,
    userId?: string,
    campusId?: string,
    status?: MembershipStatus,
    page: number = 1,
    limit: number = 20,
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.TenantMembershipWhereInput = {
      isDeleted: false,
    };

    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;
    if (campusId) where.campusId = campusId;
    if (status) where.status = status;

    const [memberships, total] = await this.prisma.$transaction([
      this.prisma.tenantMembership.findMany({
        where,
        skip,
        take: safeLimit,
        select: MEMBERSHIP_SELECT_FIELDS,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenantMembership.count({ where }),
    ]);

    return { memberships, total };
  }

  async findById(id: string) {
    return this.prisma.tenantMembership.findFirst({
      where: { id, isDeleted: false },
      select: MEMBERSHIP_SELECT_FIELDS,
    });
  }

  async findExisting(tenantId: string, userId: string, campusId?: string) {
    return this.prisma.tenantMembership.findFirst({
      where: {
        tenantId,
        userId,
        campusId: campusId || null,
        isDeleted: false,
      },
      select: MEMBERSHIP_SELECT_FIELDS,
    });
  }

  async findUserActiveMemberships(userId: string) {
    return this.prisma.tenantMembership.findMany({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
        isActive: true,
        isDeleted: false,
      },
      select: MEMBERSHIP_SELECT_FIELDS,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateMembershipData) {
    return this.prisma.tenantMembership.update({
      where: { id },
      data,
      select: MEMBERSHIP_SELECT_FIELDS,
    });
  }

  async softDelete(id: string) {
    return this.prisma.tenantMembership.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        status: MembershipStatus.REVOKED,
        deletedAt: new Date(),
      },
      select: MEMBERSHIP_SELECT_FIELDS,
    });
  }
}
