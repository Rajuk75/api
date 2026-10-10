import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  setSuccess,
  setCreateSuccess,
  setServerError,
  setNotFoundError,
  setConflictError,
  setBadRequest,
} from '../../common/utils/response.helper';
import logger from '../../common/utils/logger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ========================================== CREATE USER ==========================================
  @Post('create-new-user')
  async createUser(@Body() user: CreateUserDto, @Res() res: Response) {
    logger.debug(`users.controller.ts >>>> createUser() >>>> Body: ${JSON.stringify(user)}`);
    try {
      const createdUser = await this.usersService.create(user);
      return setCreateSuccess(res, {
        message: 'User created successfully',
        data: createdUser,
      });
    } catch (error: any) {
      logger.error(`users.controller.ts >>>> createUser() >>>> Error: ${error}`);
      if (error?.status === 409 || error?.message?.includes('already exists')) {
        return setConflictError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== GET ALL USERS ==========================================
  @Get('get-all-users')
  @UseGuards(AuthGuard)
  async getAllUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Res() res: Response,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    logger.debug(`users.controller.ts >>>> getAllUsers() >>>> Page: ${pageNum}, Limit: ${limitNum}`);
    try {
      const { users, total } = await this.usersService.findAll(pageNum, limitNum);
      return setSuccess(res, {
        message: 'Users retrieved successfully',
        data: users,
        total,
      });
    } catch (error) {
      logger.error(`users.controller.ts >>>> getAllUsers() >>>> Error: ${error}`);
      return setServerError(res, error);
    }
  }

  // ========================================== GET USER BY ID ==========================================
  @Get(':id/get-user')
  @UseGuards(AuthGuard)
  async getUserById(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`users.controller.ts >>>> getUserById() >>>> ID: ${id}`);
    try {
      const user = await this.usersService.findById(id);
      return setSuccess(res, {
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error: any) {
      logger.error(`users.controller.ts >>>> getUserById() >>>> Error: ${error}`);
      if (error?.status === 404) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== UPDATE USER ==========================================
  @Patch(':id/update-user')
  @UseGuards(AuthGuard)
  async updateUser(@Param('id') id: string, @Body() payload: UpdateUserDto, @Res() res: Response) {
    logger.debug(`users.controller.ts >>>> updateUser() >>>> ID: ${id}, Body: ${JSON.stringify(payload)}`);
    try {
      const user = await this.usersService.update(id, payload);
      return setSuccess(res, {
        message: 'User updated successfully',
        data: user,
      });
    } catch (error: any) {
      logger.error(`users.controller.ts >>>> updateUser() >>>> Error: ${error}`);
      if (error?.status === 404) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== CHANGE PASSWORD ==========================================
  @Patch(':id/change-password')
  @UseGuards(AuthGuard)
  async changePassword(
    @Param('id') id: string,
    @Body() payload: ChangePasswordDto,
    @Res() res: Response,
  ) {
    logger.debug(`users.controller.ts >>>> changePassword() >>>> ID: ${id}`);
    try {
      const result = await this.usersService.changePassword(id, payload);
      return setSuccess(res, {
        message: result.message,
      });
    } catch (error: any) {
      logger.error(`users.controller.ts >>>> changePassword() >>>> Error: ${error}`);
      if (error?.status === 404) {
        return setNotFoundError(res, error.message);
      }
      if (error?.status === 400 || error?.message?.includes('password')) {
        return setBadRequest(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== TOGGLE / DEACTIVATE USER ==========================================
  @Patch(':id/toggle-status')
  @UseGuards(AuthGuard)
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @Res() res: Response,
  ) {
    logger.debug(`users.controller.ts >>>> toggleStatus() >>>> ID: ${id}, isActive: ${isActive}`);
    try {
      const user = await this.usersService.toggleStatus(id, isActive ?? false);
      return setSuccess(res, {
        message: `User status updated to ${isActive ? 'active' : 'inactive'} successfully`,
        data: user,
      });
    } catch (error: any) {
      logger.error(`users.controller.ts >>>> toggleStatus() >>>> Error: ${error}`);
      if (error?.status === 404) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }

  // ========================================== SOFT DELETE USER ==========================================
  @Delete(':id/delete-user')
  @UseGuards(AuthGuard)
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    logger.debug(`users.controller.ts >>>> deleteUser() >>>> ID: ${id}`);
    try {
      const user = await this.usersService.softDelete(id);
      return setSuccess(res, {
        message: 'User soft-deleted successfully',
        data: user,
      });
    } catch (error: any) {
      logger.error(`users.controller.ts >>>> deleteUser() >>>> Error: ${error}`);
      if (error?.status === 404) {
        return setNotFoundError(res, error.message);
      }
      return setServerError(res, error);
    }
  }
}
