import { Injectable, NotFoundException } from '@nestjs/common';
import { CampusesRepository } from './campuses.repository';
import { TenantsRepository } from '../tenants/tenants.repository';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import logger from '../../common/utils/logger';

@Injectable()
export class CampusesService {
  constructor(
    private readonly campusesRepository: CampusesRepository,
    private readonly tenantsRepository: TenantsRepository,
  ) {}

  async create(payload: CreateCampusDto) {
    try {
      logger.info(
        `CampusesService > create > Attempting to create campus: ${payload.name} for tenant: ${payload.tenantId}`,
      );

      const tenant = await this.tenantsRepository.findById(payload.tenantId);
      if (!tenant) {
        logger.warn(`CampusesService > create > Tenant not found: ${payload.tenantId}`);
        throw new NotFoundException(`Tenant with ID "${payload.tenantId}" not found`);
      }

      if (payload.isMainBranch) {
        await this.campusesRepository.unsetMainBranches(payload.tenantId);
      }

      const createdCampus = await this.campusesRepository.create(payload);
      logger.info(`CampusesService > create > Successfully created campus ID: ${createdCampus.id}`);
      return createdCampus;
    } catch (error) {
      logger.error(`CampusesService > create > Error creating campus [${payload.name}]: ${error}`);
      throw error;
    }
  }

  async findAll(tenantId?: string, page: number = 1, limit: number = 10, search?: string) {
    try {
      logger.info(
        `CampusesService > findAll > Fetching campuses (tenant: ${tenantId || 'all'}, page: ${page}, limit: ${limit}, search: ${search || 'none'})`,
      );
      return await this.campusesRepository.findAll(tenantId, page, limit, search);
    } catch (error) {
      logger.error(`CampusesService > findAll > Error fetching campuses: ${error}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      logger.info(`CampusesService > findOne > Fetching campus ID: ${id}`);
      const campus = await this.campusesRepository.findById(id);
      if (!campus) {
        logger.warn(`CampusesService > findOne > Campus not found for ID: ${id}`);
        throw new NotFoundException(`Campus with ID "${id}" not found`);
      }
      return campus;
    } catch (error) {
      logger.error(`CampusesService > findOne > Error finding campus [${id}]: ${error}`);
      throw error;
    }
  }

  async update(id: string, payload: UpdateCampusDto) {
    try {
      logger.info(`CampusesService > update > Attempting to update campus ID: ${id}`);
      const existingCampus = await this.findOne(id);

      if (payload.isMainBranch) {
        await this.campusesRepository.unsetMainBranches(existingCampus.tenantId);
      }

      const updatedCampus = await this.campusesRepository.update(id, payload);
      logger.info(`CampusesService > update > Successfully updated campus ID: ${id}`);
      return updatedCampus;
    } catch (error) {
      logger.error(`CampusesService > update > Error updating campus [${id}]: ${error}`);
      throw error;
    }
  }

  async softDelete(id: string) {
    try {
      logger.info(`CampusesService > softDelete > Attempting to soft-delete campus ID: ${id}`);
      await this.findOne(id);

      const deletedCampus = await this.campusesRepository.softDelete(id);
      logger.info(`CampusesService > softDelete > Successfully soft-deleted campus ID: ${id}`);
      return deletedCampus;
    } catch (error) {
      logger.error(`CampusesService > softDelete > Error soft-deleting campus [${id}]: ${error}`);
      throw error;
    }
  }
}
