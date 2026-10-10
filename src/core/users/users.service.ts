import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import logger from '../../common/utils/logger';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(user: CreateUserDto) {
    try {
      logger.info(`UsersService > create > Attempting to create user with email: ${user.email}`);

      const existingUser = await this.usersRepository.findByEmail(user.email);
      if (existingUser) {
        logger.warn(`UsersService > create > Email already exists: ${user.email}`);
        throw new ConflictException('User with this email already exists');
      }

      const passwordHash = await bcrypt.hash(user.password, 10);

      const createdUser = await this.usersRepository.create({
        name: user.name,
        email: user.email,
        passwordHash,
        phoneNumber: user.phoneNumber,
      });

      logger.info(`UsersService > create > Successfully created user ID: ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      logger.error(`UsersService > create > Error creating user [${user.email}]: ${error}`);
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      logger.info(`UsersService > findAll > Fetching users (page: ${page}, limit: ${limit})`);
      return await this.usersRepository.findAll(page, limit);
    } catch (error) {
      logger.error(`UsersService > findAll > Error fetching users: ${error}`);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      logger.info(`UsersService > findById > Fetching user ID: ${id}`);
      const user = await this.usersRepository.findById(id);
      if (!user) {
        logger.warn(`UsersService > findById > User not found for ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      logger.error(`UsersService > findById > Error finding user [${id}]: ${error}`);
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      logger.info(`UsersService > findByEmail > Finding user by email: ${email}`);
      return await this.usersRepository.findByEmail(email);
    } catch (error) {
      logger.error(`UsersService > findByEmail > Error finding user [${email}]: ${error}`);
      throw error;
    }
  }

  async update(id: string, payload: UpdateUserDto) {
    try {
      logger.info(`UsersService > update > Updating user ID: ${id}`);
      await this.findById(id);

      const updateData: { name?: string; phoneNumber?: string; isActive?: boolean } = {};

      if (payload.name !== undefined) {
        updateData.name = payload.name;
      }
      if (payload.phoneNumber !== undefined) {
        updateData.phoneNumber = payload.phoneNumber;
      }
      if (payload.isActive !== undefined) {
        updateData.isActive = payload.isActive;
      }

      const updatedUser = await this.usersRepository.update(id, updateData);
      logger.info(`UsersService > update > Successfully updated user ID: ${id}`);
      return updatedUser;
    } catch (error) {
      logger.error(`UsersService > update > Error updating user [${id}]: ${error}`);
      throw error;
    }
  }

  async changePassword(id: string, payload: ChangePasswordDto) {
    try {
      logger.info(`UsersService > changePassword > Changing password for user ID: ${id}`);
      const user = await this.usersRepository.findByIdWithPassword(id);
      if (!user) {
        logger.warn(`UsersService > changePassword > User not found for ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (!user.passwordHash) {
        logger.warn(`UsersService > changePassword > User ID ${id} does not have a local password set`);
        throw new BadRequestException('User does not have a local password set');
      }

      const isMatch = await bcrypt.compare(payload.currentPassword, user.passwordHash);
      if (!isMatch) {
        logger.warn(`UsersService > changePassword > Incorrect current password for user ID: ${id}`);
        throw new BadRequestException('Current password does not match');
      }

      const newPasswordHash = await bcrypt.hash(payload.newPassword, 10);
      await this.usersRepository.updatePassword(id, newPasswordHash);

      logger.info(`UsersService > changePassword > Successfully changed password for user ID: ${id}`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error(`UsersService > changePassword > Error changing password for user [${id}]: ${error}`);
      throw error;
    }
  }

  async toggleStatus(id: string, isActive: boolean) {
    try {
      logger.info(`UsersService > toggleStatus > Updating isActive to ${isActive} for user ID: ${id}`);
      await this.findById(id);

      const updatedUser = await this.usersRepository.toggleStatus(id, isActive);
      logger.info(`UsersService > toggleStatus > Successfully updated status for user ID: ${id}`);
      return updatedUser;
    } catch (error) {
      logger.error(`UsersService > toggleStatus > Error toggling status for user [${id}]: ${error}`);
      throw error;
    }
  }

  async softDelete(id: string) {
    try {
      logger.info(`UsersService > softDelete > Soft deleting user ID: ${id}`);
      await this.findById(id);

      const deletedUser = await this.usersRepository.softDelete(id);
      logger.info(`UsersService > softDelete > Successfully soft-deleted user ID: ${id}`);
      return deletedUser;
    } catch (error) {
      logger.error(`UsersService > softDelete > Error soft-deleting user [${id}]: ${error}`);
      throw error;
    }
  }
}
