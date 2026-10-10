import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
}

export interface UpdateUserData {
  name?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export const USER_SELECT_FIELDS = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  isActive: true,
  isDeleted: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData) {
    return this.prisma.user.create({
      data,
      select: USER_SELECT_FIELDS,
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { isDeleted: false },
        skip,
        take: safeLimit,
        select: USER_SELECT_FIELDS,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: { isDeleted: false },
      }),
    ]);

    return { users, total };
  }

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, isDeleted: false },
      select: USER_SELECT_FIELDS,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, isDeleted: false },
      select: USER_SELECT_FIELDS,
    });
  }

  async findByIdWithPassword(id: string) {
    return this.prisma.user.findFirst({
      where: { id, isDeleted: false },
    });
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findFirst({
      where: { email, isDeleted: false },
    });
  }

  async update(id: string, data: UpdateUserData) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT_FIELDS,
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: USER_SELECT_FIELDS,
    });
  }

  async toggleStatus(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: USER_SELECT_FIELDS,
    });
  }

  async softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
      select: USER_SELECT_FIELDS,
    });
  }
}
