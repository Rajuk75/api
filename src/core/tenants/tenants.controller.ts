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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  setSuccess,
  setCreateSuccess,
  setServerError,
  setNotFoundError,
} from '../../common/utils/response.helper';
import logger from '../../common/utils/logger';
import { TenantStatus, TenantType } from '@prisma/client';

@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // ========================================== CREATE TENANT ==========================================
  @Post('create-new-tenant')
  async createTenant(@Body() payload: CreateTenantDto, @Res() res: Response) {
    logger.debug(`tenants.controller.ts >>>> createTenant() >>>> Body: ${JSON.stringify(payload)}`);
    try {
      const tenant = await this.tenantsService.create(payload);
      return setCreateSuccess(res, {
        message: 'Tenant created successfully',
        data: tenant,
      });
    } catch (error: any) {
      logger.error(`tenants.controller.ts >>>> createTenant() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }

  // ========================================== GET ALL TENANTS ==========================================
  @Get('get-all-tenants')
  async getAllTenants(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('type') type: TenantType,
    @Query('status') status: TenantStatus,
    @Res() res: Response,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    logger.debug(
      `tenants.controller.ts >>>> getAllTenants() >>>> Page: ${pageNum}, Limit: ${limitNum}, Search: ${search}`,
    );
    try {
      const { tenants, total } = await this.tenantsService.findAll(
        pageNum,
        limitNum,
        search,
        type,
        status,
      );
      return setSuccess(res, {
        message: 'Tenants retrieved successfully',
        data: tenants,
        total,
      });
    } catch (error) {
      logger.error(`tenants.controller.ts >>>> getAllTenants() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }

  // ========================================== GET TENANT BY ID ==========================================
  @Get(':id/get-tenant')
  async getTenantById(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`tenants.controller.ts >>>> getTenantById() >>>> ID: ${id}`);
    try {
      const tenant = await this.tenantsService.findOne(id);
      return setSuccess(res, {
        message: 'Tenant retrieved successfully',
        data: tenant,
      });
    } catch (error: any) {
      logger.error(`tenants.controller.ts >>>> getTenantById() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== UPDATE TENANT ==========================================
  @Patch(':id/update-tenant')
  async updateTenant(
    @Param('id') id: string,
    @Body() payload: UpdateTenantDto,
    @Res() res: Response,
  ) {
    logger.debug(
      `tenants.controller.ts >>>> updateTenant() >>>> ID: ${id}, Body: ${JSON.stringify(payload)}`,
    );
    try {
      const updatedTenant = await this.tenantsService.update(id, payload);
      return setSuccess(res, {
        message: 'Tenant updated successfully',
        data: updatedTenant,
      });
    } catch (error: any) {
      logger.error(`tenants.controller.ts >>>> updateTenant() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== UPDATE TENANT STATUS ==========================================
  @Patch(':id/update-status')
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() payload: UpdateTenantStatusDto,
    @Res() res: Response,
  ) {
    logger.debug(
      `tenants.controller.ts >>>> updateTenantStatus() >>>> ID: ${id}, Status: ${payload.status}`,
    );
    try {
      const updatedTenant = await this.tenantsService.updateStatus(id, payload.status);
      return setSuccess(res, {
        message: `Tenant status updated to ${payload.status}`,
        data: updatedTenant,
      });
    } catch (error: any) {
      logger.error(`tenants.controller.ts >>>> updateTenantStatus() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== DELETE TENANT ==========================================
  @Delete(':id/delete-tenant')
  async deleteTenant(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`tenants.controller.ts >>>> deleteTenant() >>>> ID: ${id}`);
    try {
      const deletedTenant = await this.tenantsService.softDelete(id);
      return setSuccess(res, {
        message: 'Tenant deleted successfully',
        data: deletedTenant,
      });
    } catch (error: any) {
      logger.error(`tenants.controller.ts >>>> deleteTenant() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }
}
