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
} from '@nestjs/common';
import { Response } from 'express';
import { CampusesService } from './campuses.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { CheckPermission } from '../../common/decorators/permissions.decorator';
import {
  setSuccess,
  setCreateSuccess,
  setServerError,
  setNotFoundError,
} from '../../common/utils/response.helper';
import logger from '../../common/utils/logger';

@Controller('campuses')
export class CampusesController {
  constructor(private readonly campusesService: CampusesService) {}

  // ========================================== CREATE CAMPUS ==========================================
  @Post('create-new-campus')
  @CheckPermission('campus:create')
  async createCampus(@Body() payload: CreateCampusDto, @Res() res: Response) {
    logger.debug(`campuses.controller.ts >>>> createCampus() >>>> Body: ${JSON.stringify(payload)}`);
    try {
      const campus = await this.campusesService.create(payload);
      return setCreateSuccess(res, {
        message: 'Campus created successfully',
        data: campus,
      });
    } catch (error: any) {
      logger.error(`campuses.controller.ts >>>> createCampus() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== GET ALL CAMPUSES ==========================================
  @Get('get-all-campuses')
  @CheckPermission('campus:read')
  async getAllCampuses(
    @Query('tenantId') tenantId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Res() res: Response,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    logger.debug(
      `campuses.controller.ts >>>> getAllCampuses() >>>> Tenant: ${tenantId}, Page: ${pageNum}, Limit: ${limitNum}, Search: ${search}`,
    );
    try {
      const { campuses, total } = await this.campusesService.findAll(
        tenantId,
        pageNum,
        limitNum,
        search,
      );
      return setSuccess(res, {
        message: 'Campuses retrieved successfully',
        data: campuses,
        total,
      });
    } catch (error) {
      logger.error(`campuses.controller.ts >>>> getAllCampuses() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }

  // ========================================== GET CAMPUS BY ID ==========================================
  @Get(':id/get-campus')
  @CheckPermission('campus:read')
  async getCampusById(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`campuses.controller.ts >>>> getCampusById() >>>> ID: ${id}`);
    try {
      const campus = await this.campusesService.findOne(id);
      return setSuccess(res, {
        message: 'Campus retrieved successfully',
        data: campus,
      });
    } catch (error: any) {
      logger.error(`campuses.controller.ts >>>> getCampusById() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== UPDATE CAMPUS ==========================================
  @Patch(':id/update-campus')
  @CheckPermission('campus:update')
  async updateCampus(
    @Param('id') id: string,
    @Body() payload: UpdateCampusDto,
    @Res() res: Response,
  ) {
    logger.debug(
      `campuses.controller.ts >>>> updateCampus() >>>> ID: ${id}, Body: ${JSON.stringify(payload)}`,
    );
    try {
      const updatedCampus = await this.campusesService.update(id, payload);
      return setSuccess(res, {
        message: 'Campus updated successfully',
        data: updatedCampus,
      });
    } catch (error: any) {
      logger.error(`campuses.controller.ts >>>> updateCampus() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== DELETE CAMPUS ==========================================
  @Delete(':id/delete-campus')
  @CheckPermission('campus:delete')
  async deleteCampus(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`campuses.controller.ts >>>> deleteCampus() >>>> ID: ${id}`);
    try {
      const deletedCampus = await this.campusesService.softDelete(id);
      return setSuccess(res, {
        message: 'Campus deleted successfully',
        data: deletedCampus,
      });
    } catch (error: any) {
      logger.error(`campuses.controller.ts >>>> deleteCampus() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }
}
