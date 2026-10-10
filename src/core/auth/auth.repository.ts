import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface CreateSessionData {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  familyId?: string;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(data: CreateSessionData) {
    return this.prisma.authSession.create({
      data,
    });
  }

  async findSessionByTokenHash(refreshTokenHash: string) {
    return this.prisma.authSession.findFirst({
      where: {
        refreshTokenHash,
        isActive: true,
        isDeleted: false,
      },
      include: {
        user: true,
      },
    });
  }

  async updateSessionLastUsed(id: string) {
    return this.prisma.authSession.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  async revokeSession(id: string) {
    return this.prisma.authSession.update({
      where: { id },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllUserSessions(userId: string) {
    return this.prisma.authSession.updateMany({
      where: { userId, isActive: true },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });
  }

  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findPasswordResetToken(tokenHash: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        isActive: true,
        isDeleted: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });
  }

  async markPasswordResetTokenUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
        isActive: false,
      },
    });
  }

  async createEmailVerificationToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findEmailVerificationToken(tokenHash: string) {
    return this.prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        isActive: true,
        isDeleted: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });
  }

  async markEmailVerificationTokenUsed(id: string) {
    return this.prisma.emailVerificationToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
        isActive: false,
      },
    });
  }
}
