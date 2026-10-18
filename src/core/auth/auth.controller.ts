import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SwitchContextDto } from './dto/switch-context.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  setSuccess,
  setServerError,
  setNotAuthorized,
  setBadRequest,
} from '../../common/utils/response.helper';
import { appConfig } from '../../config/config';
import logger from '../../common/utils/logger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ─── Private Cookie Helpers ────────────────────────────────────────────────
  private setAuthCookies(res: Response, tokens: { accessToken?: string; refreshToken?: string }) {
    const config = appConfig();
    const isProd = config.env === 'production';

    if (tokens.accessToken) {
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: config.cookie.accessTokenMaxAge,
      });
    }

    if (tokens.refreshToken) {
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: config.cookie.refreshTokenMaxAge,
      });
    }
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  // ========================================== LOGIN ==========================================
  @Post('login')
  async login(@Body() payload: LoginDto, @Req() req: Request, @Res() res: Response) {
    logger.debug(`auth.controller.ts >>>> login() >>>> Email: ${payload.email}`);
    try {
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await this.authService.login(payload, meta);
      const { accessToken, refreshToken, ...userSessionData } = result;

      this.setAuthCookies(res, { accessToken, refreshToken });

      return setSuccess(res, {
        message: 'Login successful',
        data: userSessionData,
      });
    } catch (error: any) {
      logger.error(`auth.controller.ts >>>> login() >>>> Error: ${error}`);
      if (error?.status === 401 || error?.message?.includes('password') || error?.message?.includes('deactivated')) {
        return setNotAuthorized(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== REFRESH TOKEN ==========================================
  @Post('refresh-token')
  async refreshToken(@Body() payload: Partial<RefreshTokenDto>, @Req() req: Request, @Res() res: Response) {
    logger.debug('auth.controller.ts >>>> refreshToken()');
    try {
      const token = req.cookies?.refreshToken || payload?.refreshToken;
      if (!token) {
        return setBadRequest(res, 'Refresh token is required');
      }

      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };
      const result = await this.authService.refreshToken({ refreshToken: token }, meta);

      const { accessToken, refreshToken, ...userSessionData } = result;
      this.setAuthCookies(res, { accessToken, refreshToken });

      return setSuccess(res, {
        message: 'Token refreshed successfully',
        data: userSessionData,
      });
    } catch (error: any) {
      logger.error(`auth.controller.ts >>>> refreshToken() >>>> Error: ${error}`);
      if (error?.status === 401) {
        return setNotAuthorized(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== LOGOUT ==========================================
  @Post('logout')
  async logout(@Body() payload: Partial<RefreshTokenDto>, @Res() res: Response, @Req() req?: Request) {
    logger.debug('auth.controller.ts >>>> logout()');
    try {
      const refreshToken = req?.cookies?.refreshToken || payload?.refreshToken;
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      this.clearAuthCookies(res);

      return setSuccess(res, {
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error(`auth.controller.ts >>>> logout() >>>> Error: ${error}`);
      this.clearAuthCookies(res);
      return setServerError(res, error);
    }
  }

  // ========================================== FORGOT PASSWORD ==========================================
  @Post('forgot-password')
  async forgotPassword(@Body() payload: ForgotPasswordDto, @Res() res: Response) {
    logger.debug(`auth.controller.ts >>>> forgotPassword() >>>> Email: ${payload.email}`);
    try {
      const result = await this.authService.forgotPassword(payload);
      return setSuccess(res, {
        message: result.message,
        resetToken: result.resetToken,
      });
    } catch (error: any) {
      logger.error(`auth.controller.ts >>>> forgotPassword() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }

  // ========================================== RESET PASSWORD ==========================================
  @Post('reset-password')
  async resetPassword(@Body() payload: ResetPasswordDto, @Res() res: Response) {
    logger.debug('auth.controller.ts >>>> resetPassword()');
    try {
      const result = await this.authService.resetPassword(payload);
      return setSuccess(res, {
        message: result.message,
      });
    } catch (error: any) {
      logger.error(`auth.controller.ts >>>> resetPassword() >>>> Error: ${error}`);
      if (error?.status === 400 || error?.message?.includes('expired') || error?.message?.includes('Invalid')) {
        return setBadRequest(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== SWITCH CONTEXT ==========================================
  @Post('switch-context')
  @UseGuards(AuthGuard)
  async switchContext(@Req() req: Request, @Body() payload: SwitchContextDto, @Res() res: Response) {
    const userId = req.user?.id;
    logger.debug(
      `auth.controller.ts >>>> switchContext() >>>> User: ${userId}, Tenant: ${payload.tenantId}, Campus: ${payload.campusId}`,
    );
    try {
      const result = await this.authService.switchContext(userId!, payload);
      const { accessToken, ...contextData } = result;

      this.setAuthCookies(res, { accessToken });

      return setSuccess(res, {
        message: 'Active context switched successfully',
        data: contextData,
      });
    } catch (error: any) {
      logger.error(`auth.controller.ts >>>> switchContext() >>>> Error: ${error}`);
      if (error?.status === 401 || error?.message?.includes('access')) {
        return setNotAuthorized(res, { message: error.message });
      }
      return setServerError(res, error);
    }
  }

  // ========================================== GET SESSION / ME ==========================================
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request, @Res() res: Response) {
    const userId = req.user?.id;
    logger.debug(`auth.controller.ts >>>> getMe() >>>> User: ${userId}`);
    try {
      const result = await this.authService.getMe(userId!, {
        tenantId: req.user?.tenantId,
        campusId: req.user?.campusId,
      });
      return setSuccess(res, {
        message: 'Current session retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error(`auth.controller.ts >>>> getMe() >>>> Error: ${error}`);
      if (error?.status === 401) {
        return setNotAuthorized(res, error.message);
      }
      return setServerError(res, error);
    }
  }
}
