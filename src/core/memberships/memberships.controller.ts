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
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  setSuccess,
  setCreateSuccess,
  setServerError,
  setNotFoundError,
  setConflictError,
} from '../../common/utils/response.helper';
import logger from '../../common/utils/logger';
import { MembershipStatus } from '@prisma/client';

@Controller('memberships')
@UseGuards(AuthGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // ========================================== CREATE MEMBERSHIP ==========================================
  @Post('create-new-membership')
  async createMembership(@Body() payload: CreateMembershipDto, @Res() res: Response) {
    logger.debug(
      `memberships.controller.ts >>>> createMembership() >>>> Body: ${JSON.stringify(payload)}`,
    );
    try {
      const membership = await this.membershipsService.create(payload);
      return setCreateSuccess(res, {
        message: 'User assigned to school/campus successfully',
        data: membership,
      });
    } catch (error: any) {
      logger.error(`memberships.controller.ts >>>> createMembership() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      if (error?.status === 409 || error?.message?.includes('already a member')) {
        return setConflictError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== GET MY MEMBERSHIPS ==========================================
  @Get('my-memberships')
  async getMyMemberships(@Req() req: Request, @Res() res: Response) {
    const userId = req.user?.id;
    logger.debug(`memberships.controller.ts >>>> getMyMemberships() >>>> UserId: ${userId}`);
    try {
      const memberships = await this.membershipsService.findUserMemberships(userId!);
      return setSuccess(res, {
        message: 'Your school memberships retrieved successfully',
        data: memberships,
        total: memberships.length,
      });
    } catch (error) {
      logger.error(`memberships.controller.ts >>>> getMyMemberships() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }

  // ========================================== GET ALL MEMBERSHIPS ==========================================
  @Get('get-all-memberships')
  async getAllMemberships(
    @Query('tenantId') tenantId: string,
    @Query('userId') userId: string,
    @Query('campusId') campusId: string,
    @Query('status') status: MembershipStatus,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Res() res: Response,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    logger.debug(
      `memberships.controller.ts >>>> getAllMemberships() >>>> Tenant: ${tenantId}, User: ${userId}`,
    );
    try {
      const { memberships, total } = await this.membershipsService.findAll(
        tenantId,
        userId,
        campusId,
        status,
        pageNum,
        limitNum,
      );
      return setSuccess(res, {
        message: 'Memberships retrieved successfully',
        data: memberships,
        total,
      });
    } catch (error) {
      logger.error(`memberships.controller.ts >>>> getAllMemberships() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }

  // ========================================== GET MEMBERSHIP BY ID ==========================================
  @Get(':id/get-membership')
  async getMembershipById(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`memberships.controller.ts >>>> getMembershipById() >>>> ID: ${id}`);
    try {
      const membership = await this.membershipsService.findOne(id);
      return setSuccess(res, {
        message: 'Membership retrieved successfully',
        data: membership,
      });
    } catch (error: any) {
      logger.error(`memberships.controller.ts >>>> getMembershipById() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== UPDATE MEMBERSHIP ==========================================
  @Patch(':id/update-membership')
  async updateMembership(
    @Param('id') id: string,
    @Body() payload: UpdateMembershipDto,
    @Res() res: Response,
  ) {
    logger.debug(
      `memberships.controller.ts >>>> updateMembership() >>>> ID: ${id}, Body: ${JSON.stringify(payload)}`,
    );
    try {
      const updated = await this.membershipsService.update(id, payload);
      return setSuccess(res, {
        message: 'Membership updated successfully',
        data: updated,
      });
    } catch (error: any) {
      logger.error(`memberships.controller.ts >>>> updateMembership() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== DELETE MEMBERSHIP ==========================================
  @Delete(':id/delete-membership')
  async deleteMembership(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`memberships.controller.ts >>>> deleteMembership() >>>> ID: ${id}`);
    try {
      const deleted = await this.membershipsService.softDelete(id);
      return setSuccess(res, {
        message: 'Membership revoked successfully',
        data: deleted,
      });
    } catch (error: any) {
      logger.error(`memberships.controller.ts >>>> deleteMembership() >>>> Error: ${error}`);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }
}
