import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  setSuccess,
  setCreateSuccess,
  setServerError,
  setNotFoundError,
  setConflictError,
  setNotAuthorized,
} from '../../common/utils/response.helper';
import logger from '../../common/utils/logger';
import { RoleScope } from '@prisma/client';

@Controller('roles')
@UseGuards(AuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ========================================== CREATE ROLE ==========================================
  @Post('create-new-role')
  async createRole(@Body() payload: CreateRoleDto, @Res() res: Response) {
    logger.debug(`roles.controller.ts >>>> createRole() >>>> Body: ${JSON.stringify(payload)}`);
    try {
      const role = await this.rolesService.create(payload);
      return setCreateSuccess(res, {
        message: 'Role created successfully',
        data: role,
      });
    } catch (error: any) {
      logger.error(`roles.controller.ts >>>> createRole() >>>> Error: ${error}`);
      if (error?.status === 409 || error?.message?.includes('already exists')) {
        return setConflictError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== GET ALL ROLES ==========================================
  @Get('get-all-roles')
  async getAllRoles(
    @Query('tenantId') tenantId: string,
    @Query('scope') scope: RoleScope,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Res() res: Response,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    logger.debug(
      `roles.controller.ts >>>> getAllRoles() >>>> Tenant: ${tenantId}, Scope: ${scope}, Page: ${pageNum}`,
    );
    try {
      const { roles, total } = await this.rolesService.findAll(
        tenantId,
        scope,
        pageNum,
        limitNum,
        search,
      );
      return setSuccess(res, {
        message: 'Roles retrieved successfully',
        data: roles,
        total,
      });
    } catch (error) {
      logger.error(`roles.controller.ts >>>> getAllRoles() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }

  // ========================================== GET ROLE BY ID ==========================================
  @Get(':id/get-role')
  async getRoleById(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`roles.controller.ts >>>> getRoleById() >>>> ID: ${id}`);
    try {
      const role = await this.rolesService.findOne(id);
      return setSuccess(res, {
        message: 'Role retrieved successfully',
        data: role,
      });
    } catch (error: any) {
      logger.error(`roles.controller.ts >>>> getRoleById() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== UPDATE ROLE ==========================================
  @Patch(':id/update-role')
  async updateRole(
    @Param('id') id: string,
    @Body() payload: UpdateRoleDto,
    @Res() res: Response,
  ) {
    logger.debug(
      `roles.controller.ts >>>> updateRole() >>>> ID: ${id}, Body: ${JSON.stringify(payload)}`,
    );
    try {
      const updatedRole = await this.rolesService.update(id, payload);
      return setSuccess(res, {
        message: 'Role updated successfully',
        data: updatedRole,
      });
    } catch (error: any) {
      logger.error(`roles.controller.ts >>>> updateRole() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      if (error?.status === 403 || error?.message?.includes('cannot be modified')) {
        return setNotAuthorized(res, { message: error.message });
      }
      return setServerError(res, error);
    }
  }

  // ========================================== DELETE ROLE ==========================================
  @Delete(':id/delete-role')
  async deleteRole(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`roles.controller.ts >>>> deleteRole() >>>> ID: ${id}`);
    try {
      const deletedRole = await this.rolesService.softDelete(id);
      return setSuccess(res, {
        message: 'Role deleted successfully',
        data: deletedRole,
      });
    } catch (error: any) {
      logger.error(`roles.controller.ts >>>> deleteRole() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      if (error?.status === 403 || error?.message?.includes('cannot be deleted')) {
        return setNotAuthorized(res, { message: error.message });
      }
      return setServerError(res, error);
    }
  }
}
