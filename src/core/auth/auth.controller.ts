import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
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
import logger from '../../common/utils/logger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      return setSuccess(res, {
        message: 'Login successful',
        data: result,
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
  async refreshToken(@Body() payload: RefreshTokenDto, @Req() req: Request, @Res() res: Response) {
    logger.debug('auth.controller.ts >>>> refreshToken()');
    try {
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };
      const result = await this.authService.refreshToken(payload, meta);
      return setSuccess(res, {
        message: 'Token refreshed successfully',
        data: result,
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
  async logout(@Body() payload: RefreshTokenDto, @Res() res: Response) {
    logger.debug('auth.controller.ts >>>> logout()');
    try {
      const result = await this.authService.logout(payload.refreshToken);
      return setSuccess(res, {
        message: result.message,
      });
    } catch (error: any) {
      logger.error(`auth.controller.ts >>>> logout() >>>> Error: ${error}`);
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
  async switchContext(
    @Req() req: Request,
    @Body() payload: SwitchContextDto,
    @Res() res: Response,
  ) {
    const userId = req.user?.id;
    logger.debug(
      `auth.controller.ts >>>> switchContext() >>>> User: ${userId}, Tenant: ${payload.tenantId}, Campus: ${payload.campusId}`,
    );
    try {
      const result = await this.authService.switchContext(userId!, payload);
      return setSuccess(res, {
        message: 'Active context switched successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error(`auth.controller.ts >>>> switchContext() >>>> Error: ${error}`);
      if (error?.status === 401 || error?.message?.includes('access')) {
        return setNotAuthorized(res, { message: error.message });
      }
      return setServerError(res, error);
    }
  }
}
