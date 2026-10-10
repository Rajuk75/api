import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { TenantsModule } from './core/tenants/tenants.module';
import { CampusesModule } from './core/campuses/campuses.module';
import { RolesModule } from './core/roles/roles.module';
import { PermissionsModule } from './core/permissions/permissions.module';
import { MembershipsModule } from './core/memberships/memberships.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    TenantsModule,
    CampusesModule,
    RolesModule,
    PermissionsModule,
    MembershipsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
