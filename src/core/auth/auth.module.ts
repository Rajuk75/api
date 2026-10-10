import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [UsersModule, MembershipsModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
