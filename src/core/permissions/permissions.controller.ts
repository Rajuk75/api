import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  setSuccess,
  setCreateSuccess,
  setServerError,
  setNotFoundError,
  setConflictError,
} from '../../common/utils/response.helper';
import logger from '../../common/utils/logger';

@Controller('permissions')
@UseGuards(AuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // ========================================== GET ALL PERMISSIONS ==========================================
  @Get('get-all-permissions')
  async getAllPermissions(
    @Query('resource') resource: string,
    @Query('action') action: string,
    @Res() res: Response,
  ) {
    logger.debug(
      `permissions.controller.ts >>>> getAllPermissions() >>>> Resource: ${resource}, Action: ${action}`,
    );
    try {
      const permissions = await this.permissionsService.findAll(resource, action);
      return setSuccess(res, {
        message: 'Permissions retrieved successfully',
        data: permissions,
        total: permissions.length,
      });
    } catch (error) {
      logger.error(`permissions.controller.ts >>>> getAllPermissions() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }

  // ========================================== GET PERMISSION BY ID ==========================================
  @Get(':id/get-permission')
  async getPermissionById(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`permissions.controller.ts >>>> getPermissionById() >>>> ID: ${id}`);
    try {
      const permission = await this.permissionsService.findOne(id);
      return setSuccess(res, {
        message: 'Permission retrieved successfully',
        data: permission,
      });
    } catch (error: any) {
      logger.error(`permissions.controller.ts >>>> getPermissionById() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== CREATE PERMISSION ==========================================
  @Post('create-new-permission')
  async createPermission(@Body() payload: CreatePermissionDto, @Res() res: Response) {
    logger.debug(
      `permissions.controller.ts >>>> createPermission() >>>> Body: ${JSON.stringify(payload)}`,
    );
    try {
      const created = await this.permissionsService.create(payload);
      return setCreateSuccess(res, {
        message: 'Permission created successfully',
        data: created,
      });
    } catch (error: any) {
      logger.error(`permissions.controller.ts >>>> createPermission() >>>> Error: ${error}`);
      if (error?.status === 409 || error?.message?.includes('already exists')) {
        return setConflictError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== SEED DEFAULT PERMISSIONS ==========================================
  @Post('seed-default-permissions')
  async seedPermissions(@Res() res: Response) {
    logger.debug('permissions.controller.ts >>>> seedPermissions()');
    try {
      const seeded = await this.permissionsService.seedDefaultPermissions();
      return setSuccess(res, {
        message: 'Default permissions seeded successfully',
        data: seeded,
        total: seeded.length,
      });
    } catch (error) {
      logger.error(`permissions.controller.ts >>>> seedPermissions() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }
}
