import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Optional } from '@nestjs/common';
import { Request } from 'express';
import { TokenHelper } from '../utils/token.helper';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { setUserContext } from '../utils/context';
import logger from '../utils/logger';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Optional() private readonly prisma?: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    let token = request.cookies?.accessToken;

    if (!token && request.headers.authorization) {
      const [scheme, authToken] = request.headers.authorization.split(' ');
      if (scheme === 'Bearer') {
        token = authToken;
      }
    }

    if (!token) {
      logger.warn('AuthGuard > No authorization token found in cookie or header');
      throw new UnauthorizedException('Authorization token is required');
    }

    let decoded: any;
    try {
      decoded = TokenHelper.verifyAccessToken(token);
    } catch (err: any) {
      logger.warn(`AuthGuard > Invalid or expired token: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const userId = decoded.userId || decoded.sub;

    let user = null;
    if (this.prisma) {
      user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          isActive: true,
        },
      });

      if (!user) {
        logger.warn(`AuthGuard > User not found or inactive in DB for ID: ${userId}`);
        throw new UnauthorizedException('User not found or account is deactivated');
      }
    }

    const authUser: any = user ? { ...user } : { ...decoded };
    if (decoded.tenantId) authUser.tenantId = decoded.tenantId;
    if (decoded.campusId) authUser.campusId = decoded.campusId;
    if (decoded.role) authUser.role = decoded.role;

    request.user = authUser;
    setUserContext(authUser);

    return true;
  }
}
