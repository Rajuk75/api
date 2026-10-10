import { Module } from '@nestjs/common';
import { CampusesController } from './campuses.controller';
import { CampusesService } from './campuses.service';
import { CampusesRepository } from './campuses.repository';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  controllers: [CampusesController],
  providers: [CampusesService, CampusesRepository],
  exports: [CampusesService, CampusesRepository],
})
export class CampusesModule {}
