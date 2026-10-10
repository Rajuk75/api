import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { MembershipsRepository } from './memberships.repository';
import { UsersRepository } from '../users/users.repository';
import { TenantsRepository } from '../tenants/tenants.repository';
import { RolesRepository } from '../roles/roles.repository';
import { CampusesRepository } from '../campuses/campuses.repository';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { MembershipStatus } from '@prisma/client';
import logger from '../../common/utils/logger';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly membershipsRepository: MembershipsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly tenantsRepository: TenantsRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly campusesRepository: CampusesRepository,
  ) {}

  async create(payload: CreateMembershipDto) {
    try {
      logger.info(
        `MembershipsService > create > Adding user ${payload.userId} to tenant ${payload.tenantId}`,
      );

      // 1. Verify user exists
      const user = await this.usersRepository.findById(payload.userId);
      if (!user) {
        logger.warn(`MembershipsService > create > User not found: ${payload.userId}`);
        throw new NotFoundException(`User with ID "${payload.userId}" not found`);
      }

      // 2. Verify tenant exists
      const tenant = await this.tenantsRepository.findById(payload.tenantId);
      if (!tenant) {
        logger.warn(`MembershipsService > create > Tenant not found: ${payload.tenantId}`);
        throw new NotFoundException(`Tenant with ID "${payload.tenantId}" not found`);
      }

      // 3. Verify role exists
      const role = await this.rolesRepository.findById(payload.roleId);
      if (!role) {
        logger.warn(`MembershipsService > create > Role not found: ${payload.roleId}`);
        throw new NotFoundException(`Role with ID "${payload.roleId}" not found`);
      }

      // 4. Verify campus exists if provided
      if (payload.campusId) {
        const campus = await this.campusesRepository.findById(payload.campusId);
        if (!campus || campus.tenantId !== payload.tenantId) {
          logger.warn(`MembershipsService > create > Invalid campus ID: ${payload.campusId}`);
          throw new NotFoundException(`Campus with ID "${payload.campusId}" not found for this tenant`);
        }
      }

      // 5. Check if membership already exists
      const existing = await this.membershipsRepository.findExisting(
        payload.tenantId,
        payload.userId,
        payload.campusId,
      );
      if (existing) {
        logger.warn(
          `MembershipsService > create > Membership already exists for user ${payload.userId} in tenant ${payload.tenantId}`,
        );
        throw new ConflictException('User is already a member of this tenant/campus');
      }

      const membership = await this.membershipsRepository.create(payload);
      logger.info(`MembershipsService > create > Successfully created membership ID: ${membership.id}`);
      return membership;
    } catch (error) {
      logger.error(`MembershipsService > create > Error creating membership: ${error}`);
      throw error;
    }
  }

  async findAll(
    tenantId?: string,
    userId?: string,
    campusId?: string,
    status?: MembershipStatus,
    page: number = 1,
    limit: number = 20,
  ) {
    try {
      logger.info(`MembershipsService > findAll > Fetching memberships`);
      return await this.membershipsRepository.findAll(tenantId, userId, campusId, status, page, limit);
    } catch (error) {
      logger.error(`MembershipsService > findAll > Error fetching memberships: ${error}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      logger.info(`MembershipsService > findOne > Fetching membership ID: ${id}`);
      const membership = await this.membershipsRepository.findById(id);
      if (!membership) {
        logger.warn(`MembershipsService > findOne > Membership not found: ${id}`);
        throw new NotFoundException(`Membership with ID "${id}" not found`);
      }
      return membership;
    } catch (error) {
      logger.error(`MembershipsService > findOne > Error finding membership [${id}]: ${error}`);
      throw error;
    }
  }

  async findUserMemberships(userId: string) {
    try {
      logger.info(`MembershipsService > findUserMemberships > Fetching memberships for user: ${userId}`);
      return await this.membershipsRepository.findUserActiveMemberships(userId);
    } catch (error) {
      logger.error(`MembershipsService > findUserMemberships > Error for user [${userId}]: ${error}`);
      throw error;
    }
  }

  async update(id: string, payload: UpdateMembershipDto) {
    try {
      logger.info(`MembershipsService > update > Attempting to update membership ID: ${id}`);
      await this.findOne(id);

      if (payload.roleId) {
        const role = await this.rolesRepository.findById(payload.roleId);
        if (!role) {
          throw new NotFoundException(`Role with ID "${payload.roleId}" not found`);
        }
      }

      const updated = await this.membershipsRepository.update(id, payload);
      logger.info(`MembershipsService > update > Successfully updated membership ID: ${id}`);
      return updated;
    } catch (error) {
      logger.error(`MembershipsService > update > Error updating membership [${id}]: ${error}`);
      throw error;
    }
  }

  async softDelete(id: string) {
    try {
      logger.info(`MembershipsService > softDelete > Revoking membership ID: ${id}`);
      await this.findOne(id);

      const revoked = await this.membershipsRepository.softDelete(id);
      logger.info(`MembershipsService > softDelete > Successfully revoked membership ID: ${id}`);
      return revoked;
    } catch (error) {
      logger.error(`MembershipsService > softDelete > Error revoking membership [${id}]: ${error}`);
      throw error;
    }
  }
}
