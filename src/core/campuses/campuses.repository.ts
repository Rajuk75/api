import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateCampusData {
  tenantId: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phoneNumber?: string;
  email?: string;
  isMainBranch?: boolean;
}

export interface UpdateCampusData {
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phoneNumber?: string;
  email?: string;
  isMainBranch?: boolean;
  isActive?: boolean;
}

export const CAMPUS_SELECT_FIELDS = {
  id: true,
  tenantId: true,
  name: true,
  code: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  phoneNumber: true,
  email: true,
  isMainBranch: true,
  isActive: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CampusesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCampusData) {
    return this.prisma.campus.create({
      data,
      select: CAMPUS_SELECT_FIELDS,
    });
  }

  async findAll(tenantId?: string, page: number = 1, limit: number = 10, search?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.CampusWhereInput = {
      isDeleted: false,
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [campuses, total] = await this.prisma.$transaction([
      this.prisma.campus.findMany({
        where,
        skip,
        take: safeLimit,
        select: CAMPUS_SELECT_FIELDS,
        orderBy: [{ isMainBranch: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.campus.count({ where }),
    ]);

    return { campuses, total };
  }

  async findById(id: string) {
    return this.prisma.campus.findFirst({
      where: { id, isDeleted: false },
      select: CAMPUS_SELECT_FIELDS,
    });
  }

  async update(id: string, data: UpdateCampusData) {
    return this.prisma.campus.update({
      where: { id },
      data,
      select: CAMPUS_SELECT_FIELDS,
    });
  }

  async softDelete(id: string) {
    return this.prisma.campus.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
      select: CAMPUS_SELECT_FIELDS,
    });
  }

  async unsetMainBranches(tenantId: string) {
    return this.prisma.campus.updateMany({
      where: { tenantId, isMainBranch: true },
      data: { isMainBranch: false },
    });
  }
}
