import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { UsersRepository } from '../users/users.repository';
import { MembershipsRepository } from '../memberships/memberships.repository';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SwitchContextDto } from './dto/switch-context.dto';
import { TokenHelper } from '../../common/utils/token.helper';
import logger from '../../common/utils/logger';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly membershipsRepository: MembershipsRepository,
  ) {}

  async login(payload: LoginDto, meta?: { ipAddress?: string; userAgent?: string }) {
    try {
      logger.info(`AuthService > login > Login attempt for email: ${payload.email}`);

      const user = await this.usersRepository.findByEmailWithPassword(payload.email);
      if (!user || user.isDeleted) {
        logger.warn(`AuthService > login > User not found or deleted: ${payload.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.isActive) {
        logger.warn(`AuthService > login > User account inactive: ${payload.email}`);
        throw new UnauthorizedException('User account is deactivated');
      }

      if (!user.passwordHash) {
        logger.warn(`AuthService > login > User has no password set: ${payload.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
      if (!isPasswordValid) {
        logger.warn(`AuthService > login > Invalid password for: ${payload.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      // Fetch user's active school/campus memberships
      const memberships = await this.membershipsRepository.findUserActiveMemberships(user.id);
      const defaultMembership = memberships.length > 0 ? memberships[0] : null;

      const { accessToken, expiresIn } = TokenHelper.generateAccessToken({
        userId: user.id,
        email: user.email,
        tenantId: defaultMembership?.tenantId,
        campusId: defaultMembership?.campusId,
        role: defaultMembership?.role,
      });

      const refreshToken = TokenHelper.generateRandomToken(40);
      const refreshTokenHash = TokenHelper.hashToken(refreshToken);
      const expiresAt = TokenHelper.getRefreshTokenExpiry(7);

      await this.authRepository.createSession({
        userId: user.id,
        refreshTokenHash,
        expiresAt,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });

      logger.info(`AuthService > login > Successfully logged in user ID: ${user.id}`);
      return {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isActive: user.isActive,
        },
        activeContext: defaultMembership
          ? {
              tenant: defaultMembership.tenant,
              campus: defaultMembership.campus,
              role: defaultMembership.role,
            }
          : null,
        memberships,
      };
    } catch (error) {
      logger.error(`AuthService > login > Error during login [${payload.email}]: ${error}`);
      throw error;
    }
  }

  async refreshToken(payload: RefreshTokenDto, meta?: { ipAddress?: string; userAgent?: string }) {
    try {
      logger.info('AuthService > refreshToken > Attempting token rotation');

      const tokenHash = TokenHelper.hashToken(payload.refreshToken);
      const session = await this.authRepository.findSessionByTokenHash(tokenHash);

      if (!session) {
        logger.warn('AuthService > refreshToken > Session not found or inactive');
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      if (session.expiresAt < new Date()) {
        logger.warn('AuthService > refreshToken > Session expired');
        await this.authRepository.revokeSession(session.id);
        throw new UnauthorizedException('Refresh token has expired');
      }

      const { accessToken, expiresIn } = TokenHelper.generateAccessToken({
        userId: session.user.id,
        email: session.user.email,
      });

      const newRefreshToken = TokenHelper.generateRandomToken(40);
      const newRefreshTokenHash = TokenHelper.hashToken(newRefreshToken);
      const expiresAt = TokenHelper.getRefreshTokenExpiry(7);

      await Promise.all([
        this.authRepository.revokeSession(session.id),
        this.authRepository.createSession({
          userId: session.user.id,
          refreshTokenHash: newRefreshTokenHash,
          expiresAt,
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        }),
      ]);

      logger.info(`AuthService > refreshToken > Successfully refreshed tokens for user ID: ${session.user.id}`);
      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          phoneNumber: session.user.phoneNumber,
          isActive: session.user.isActive,
        },
      };
    } catch (error) {
      logger.error(`AuthService > refreshToken > Error refreshing token: ${error}`);
      throw error;
    }
  }

  async logout(refreshToken: string) {
    try {
      logger.info('AuthService > logout > Logging out session');
      const tokenHash = TokenHelper.hashToken(refreshToken);
      const session = await this.authRepository.findSessionByTokenHash(tokenHash);

      if (session) {
        await this.authRepository.revokeSession(session.id);
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error(`AuthService > logout > Error during logout: ${error}`);
      throw error;
    }
  }

  async forgotPassword(payload: ForgotPasswordDto) {
    try {
      logger.info(`AuthService > forgotPassword > Request for email: ${payload.email}`);

      const user = await this.usersRepository.findByEmail(payload.email);
      let resetToken: string | undefined;

      if (user && user.isActive && !user.isDeleted) {
        resetToken = TokenHelper.generateRandomToken(32);
        const tokenHash = TokenHelper.hashToken(resetToken);
        const expiresAt = TokenHelper.getResetTokenExpiry(1);

        await this.authRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);
        logger.info(`AuthService > forgotPassword > Created reset token for user ID: ${user.id}`);
      }

      return {
        message: 'If the email exists, a password reset link has been generated.',
        resetToken,
      };
    } catch (error) {
      logger.error(`AuthService > forgotPassword > Error in forgotPassword [${payload.email}]: ${error}`);
      throw error;
    }
  }

  async resetPassword(payload: ResetPasswordDto) {
    try {
      logger.info('AuthService > resetPassword > Attempting password reset');

      const tokenHash = TokenHelper.hashToken(payload.token);
      const resetRecord = await this.authRepository.findPasswordResetToken(tokenHash);

      if (!resetRecord) {
        logger.warn('AuthService > resetPassword > Invalid or expired reset token');
        throw new BadRequestException('Invalid or expired password reset token');
      }

      const newPasswordHash = await bcrypt.hash(payload.newPassword, 10);

      await Promise.all([
        this.usersRepository.updatePassword(resetRecord.userId, newPasswordHash),
        this.authRepository.markPasswordResetTokenUsed(resetRecord.id),
        this.authRepository.revokeAllUserSessions(resetRecord.userId),
      ]);

      logger.info(`AuthService > resetPassword > Password reset successfully for user ID: ${resetRecord.userId}`);
      return { message: 'Password has been reset successfully' };
    } catch (error) {
      logger.error(`AuthService > resetPassword > Error resetting password: ${error}`);
      throw error;
    }
  }

  async switchContext(userId: string, payload: SwitchContextDto) {
    try {
      logger.info(
        `AuthService > switchContext > Switching context for user ${userId} to tenant: ${payload.tenantId}`,
      );

      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const membership = await this.membershipsRepository.findExisting(
        payload.tenantId,
        userId,
        payload.campusId,
      );

      if (!membership || membership.status !== 'ACTIVE' || !membership.isActive) {
        logger.warn(
          `AuthService > switchContext > User ${userId} is not an active member of tenant ${payload.tenantId}`,
        );
        throw new UnauthorizedException('You do not have access to this school or campus');
      }

      const { accessToken, expiresIn } = TokenHelper.generateAccessToken({
        userId: user.id,
        email: user.email,
        tenantId: membership.tenantId,
        campusId: membership.campusId,
        role: membership.role,
      });

      logger.info(
        `AuthService > switchContext > Successfully switched context for user ${userId} to tenant ${payload.tenantId}`,
      );
      return {
        accessToken,
        expiresIn,
        activeContext: {
          tenant: membership.tenant,
          campus: membership.campus,
          role: membership.role,
        },
      };
    } catch (error) {
      logger.error(`AuthService > switchContext > Error: ${error}`);
      throw error;
    }
  }

  async getMe(userId: string, context?: { tenantId?: string; campusId?: string }) {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const memberships = await this.membershipsRepository.findUserActiveMemberships(user.id);
      let activeMembership = null;

      if (context?.tenantId) {
        activeMembership = memberships.find(
          (m) => m.tenantId === context.tenantId && (!context.campusId || m.campusId === context.campusId),
        );
      }
      if (!activeMembership && memberships.length > 0) {
        activeMembership = memberships[0];
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isActive: user.isActive,
        },
        activeContext: activeMembership
          ? {
              tenant: activeMembership.tenant,
              campus: activeMembership.campus,
              role: activeMembership.role,
            }
          : null,
        memberships,
      };
    } catch (error) {
      logger.error(`AuthService > getMe > Error fetching session for user ${userId}: ${error}`);
      throw error;
    }
  }
}
