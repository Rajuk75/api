import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleScope } from '@prisma/client';
import logger from '../../common/utils/logger';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async create(payload: CreateRoleDto) {
    try {
      logger.info(
        `RolesService > create > Attempting to create role: ${payload.name} for tenant: ${payload.tenantId || 'platform'}`,
      );

      const existingRole = await this.rolesRepository.findByName(payload.name, payload.tenantId);
      if (existingRole) {
        logger.warn(`RolesService > create > Role name already exists: ${payload.name}`);
        throw new ConflictException(`Role with name "${payload.name}" already exists`);
      }

      const createdRole = await this.rolesRepository.create(payload);
      logger.info(`RolesService > create > Successfully created role ID: ${createdRole.id}`);
      return createdRole;
    } catch (error) {
      logger.error(`RolesService > create > Error creating role [${payload.name}]: ${error}`);
      throw error;
    }
  }

  async findAll(
    tenantId?: string,
    scope?: RoleScope,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ) {
    try {
      logger.info(
        `RolesService > findAll > Fetching roles (tenant: ${tenantId || 'all'}, scope: ${scope || 'all'}, page: ${page}, limit: ${limit})`,
      );
      return await this.rolesRepository.findAll(tenantId, scope, page, limit, search);
    } catch (error) {
      logger.error(`RolesService > findAll > Error fetching roles: ${error}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      logger.info(`RolesService > findOne > Fetching role ID: ${id}`);
      const role = await this.rolesRepository.findById(id);
      if (!role) {
        logger.warn(`RolesService > findOne > Role not found for ID: ${id}`);
        throw new NotFoundException(`Role with ID "${id}" not found`);
      }
      return role;
    } catch (error) {
      logger.error(`RolesService > findOne > Error finding role [${id}]: ${error}`);
      throw error;
    }
  }

  async update(id: string, payload: UpdateRoleDto) {
    try {
      logger.info(`RolesService > update > Attempting to update role ID: ${id}`);
      const existingRole = await this.findOne(id);

      if (existingRole.isSystem) {
        logger.warn(`RolesService > update > Cannot update system role ID: ${id}`);
        throw new ForbiddenException('System roles cannot be modified');
      }

      const updatedRole = await this.rolesRepository.update(id, payload);
      logger.info(`RolesService > update > Successfully updated role ID: ${id}`);
      return updatedRole;
    } catch (error) {
      logger.error(`RolesService > update > Error updating role [${id}]: ${error}`);
      throw error;
    }
  }

  async softDelete(id: string) {
    try {
      logger.info(`RolesService > softDelete > Attempting to soft-delete role ID: ${id}`);
      const existingRole = await this.findOne(id);

      if (existingRole.isSystem) {
        logger.warn(`RolesService > softDelete > Cannot delete system role ID: ${id}`);
        throw new ForbiddenException('System roles cannot be deleted');
      }

      const deletedRole = await this.rolesRepository.softDelete(id);
      logger.info(`RolesService > softDelete > Successfully soft-deleted role ID: ${id}`);
      return deletedRole;
    } catch (error) {
      logger.error(`RolesService > softDelete > Error soft-deleting role [${id}]: ${error}`);
      throw error;
    }
  }
}
