import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantStatus, TenantType } from '@prisma/client';
import logger from '../../common/utils/logger';

@Injectable()
export class TenantsService {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  async create(payload: CreateTenantDto) {
    try {
      logger.info(`TenantsService > create > Attempting to create tenant: ${payload.name}`);

      const createdTenant = await this.tenantsRepository.create(payload);

      logger.info(`TenantsService > create > Successfully created tenant ID: ${createdTenant.id}`);
      return createdTenant;
    } catch (error) {
      logger.error(`TenantsService > create > Error creating tenant [${payload.name}]: ${error}`);
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: TenantType,
    status?: TenantStatus,
  ) {
    try {
      logger.info(
        `TenantsService > findAll > Fetching tenants (page: ${page}, limit: ${limit}, search: ${search || 'none'})`,
      );
      return await this.tenantsRepository.findAll(page, limit, search, type, status);
    } catch (error) {
      logger.error(`TenantsService > findAll > Error fetching tenants: ${error}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      logger.info(`TenantsService > findOne > Fetching tenant ID: ${id}`);
      const tenant = await this.tenantsRepository.findById(id);
      if (!tenant) {
        logger.warn(`TenantsService > findOne > Tenant not found for ID: ${id}`);
        throw new NotFoundException(`Tenant with ID "${id}" not found`);
      }
      return tenant;
    } catch (error) {
      logger.error(`TenantsService > findOne > Error finding tenant [${id}]: ${error}`);
      throw error;
    }
  }

  async update(id: string, payload: UpdateTenantDto) {
    try {
      logger.info(`TenantsService > update > Attempting to update tenant ID: ${id}`);
      await this.findOne(id);

      const updatedTenant = await this.tenantsRepository.update(id, payload);

      logger.info(`TenantsService > update > Successfully updated tenant ID: ${id}`);
      return updatedTenant;
    } catch (error) {
      logger.error(`TenantsService > update > Error updating tenant [${id}]: ${error}`);
      throw error;
    }
  }

  async softDelete(id: string) {
    try {
      logger.info(`TenantsService > softDelete > Attempting to soft-delete tenant ID: ${id}`);
      await this.findOne(id);

      const deletedTenant = await this.tenantsRepository.softDelete(id);
      logger.info(`TenantsService > softDelete > Successfully soft-deleted tenant ID: ${id}`);
      return deletedTenant;
    } catch (error) {
      logger.error(`TenantsService > softDelete > Error soft-deleting tenant [${id}]: ${error}`);
      throw error;
    }
  }

  async updateStatus(id: string, status: TenantStatus) {
    try {
      logger.info(`TenantsService > updateStatus > Updating status to ${status} for tenant ID: ${id}`);
      await this.findOne(id);

      const updatedTenant = await this.tenantsRepository.updateStatus(id, status);
      logger.info(`TenantsService > updateStatus > Successfully updated status for tenant ID: ${id}`);
      return updatedTenant;
    } catch (error) {
      logger.error(`TenantsService > updateStatus > Error updating status for tenant [${id}]: ${error}`);
      throw error;
    }
  }
}
