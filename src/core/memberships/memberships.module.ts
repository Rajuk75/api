import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { MembershipsRepository } from './memberships.repository';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { CampusesModule } from '../campuses/campuses.module';

@Module({
  imports: [UsersModule, TenantsModule, CampusesModule],
  controllers: [MembershipsController],
  providers: [MembershipsService, MembershipsRepository],
  exports: [MembershipsService, MembershipsRepository],
})
export class MembershipsModule {}
