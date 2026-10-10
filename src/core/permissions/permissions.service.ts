import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PermissionsRepository, CreatePermissionData } from './permissions.repository';
import { CreatePermissionDto } from './dto/create-permission.dto';
import logger from '../../common/utils/logger';

import { SYSTEM_PERMISSIONS } from '../../../prisma/seeds/permissions.seed';

export const DEFAULT_SYSTEM_PERMISSIONS = SYSTEM_PERMISSIONS;

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async create(payload: CreatePermissionDto) {
    try {
      logger.info(`PermissionsService > create > Attempting to create permission: ${payload.code}`);

      const existingPermission = await this.permissionsRepository.findByCode(payload.code);
      if (existingPermission) {
        logger.warn(`PermissionsService > create > Permission code already exists: ${payload.code}`);
        throw new ConflictException(`Permission with code "${payload.code}" already exists`);
      }

      const created = await this.permissionsRepository.create(payload);
      logger.info(`PermissionsService > create > Successfully created permission ID: ${created.id}`);
      return created;
    } catch (error) {
      logger.error(`PermissionsService > create > Error creating permission [${payload.code}]: ${error}`);
      throw error;
    }
  }

  async findAll(resource?: string, action?: string) {
    try {
      logger.info(
        `PermissionsService > findAll > Fetching permissions (resource: ${resource || 'all'}, action: ${action || 'all'})`,
      );
      return await this.permissionsRepository.findAll(resource, action);
    } catch (error) {
      logger.error(`PermissionsService > findAll > Error fetching permissions: ${error}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      logger.info(`PermissionsService > findOne > Fetching permission ID: ${id}`);
      const permission = await this.permissionsRepository.findById(id);
      if (!permission) {
        logger.warn(`PermissionsService > findOne > Permission not found for ID: ${id}`);
        throw new NotFoundException(`Permission with ID "${id}" not found`);
      }
      return permission;
    } catch (error) {
      logger.error(`PermissionsService > findOne > Error finding permission [${id}]: ${error}`);
      throw error;
    }
  }

  async seedDefaultPermissions() {
    try {
      logger.info('PermissionsService > seedDefaultPermissions > Seeding system permissions');
      const seeded = await this.permissionsRepository.bulkCreate(DEFAULT_SYSTEM_PERMISSIONS);
      logger.info(
        `PermissionsService > seedDefaultPermissions > Successfully seeded ${seeded.length} permissions`,
      );
      return seeded;
    } catch (error) {
      logger.error(`PermissionsService > seedDefaultPermissions > Error seeding: ${error}`);
      throw error;
    }
  }
}
